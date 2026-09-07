from typing import List, Optional
import json
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import (
    LearnerProfile, Assessment, Question, AssessmentAttempt, LearnerSkill, Skill
)
from app.schemas.schemas import (
    AssessmentRead, QuestionRead, AssessmentSubmitRequest, AssessmentResultResponse, QuestionResult
)
from app.roadmap.adaptive_engine import adapt_roadmap_after_assessment

router = APIRouter()

@router.get("/assessment/list", response_model=List[AssessmentRead])
def list_assessments(skill_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Lists available assessments."""
    query = db.query(Assessment)
    if skill_id:
        query = query.filter(Assessment.skill_id == skill_id)
    assessments = query.all()
    results = []
    for a in assessments:
        results.append(AssessmentRead(
            id=a.id,
            title=a.title,
            skill_id=a.skill_id,
            skill_name=a.skill.name if a.skill else "Skill",
            difficulty=a.difficulty,
            passing_score=a.passing_score,
            description=a.description,
            questions_count=len(a.questions),
            questions=[]
        ))
    return results

@router.get("/assessment/{assessment_id}", response_model=AssessmentRead)
def get_assessment_details(assessment_id: int, db: Session = Depends(get_db)):
    """Retrieves full assessment questions and choices for taking a test."""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    questions_read = []
    for q in assessment.questions:
        try:
            options = json.loads(q.options_json)
        except Exception:
            options = ["Option A", "Option B", "Option C", "Option D"]
        questions_read.append(QuestionRead(
            id=q.id,
            question_text=q.question_text,
            question_type=q.question_type,
            options=options,
            points=q.points
        ))

    return AssessmentRead(
        id=assessment.id,
        title=assessment.title,
        skill_id=assessment.skill_id,
        skill_name=assessment.skill.name if assessment.skill else "Skill",
        difficulty=assessment.difficulty,
        passing_score=assessment.passing_score,
        description=assessment.description,
        questions_count=len(questions_read),
        questions=questions_read
    )

@router.post("/assessment/submit", response_model=AssessmentResultResponse)
def submit_assessment(req: AssessmentSubmitRequest, db: Session = Depends(get_db)):
    """
    Evaluates assessment answers, calculates score, triggers real-time adaptive
    learning engine, and updates learner skill proficiency & confidence.
    """
    assessment = db.query(Assessment).filter(Assessment.id == req.assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    profile = db.query(LearnerProfile).filter(LearnerProfile.id == req.profile_id).first()
    if not profile:
        profile = db.query(LearnerProfile).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Learner profile not found.")

    total_points = sum(q.points for q in assessment.questions)
    earned_points = 0
    question_results = []
    weak_topics = []

    for q in assessment.questions:
        user_ans = req.answers.get(q.id, "").strip()
        is_corr = (user_ans.lower() == q.correct_answer.strip().lower())
        pts = q.points if is_corr else 0
        earned_points += pts
        if not is_corr:
            weak_topics.append(q.question_text[:40] + "...")

        question_results.append(QuestionResult(
            question_id=q.id,
            question_text=q.question_text,
            user_answer=user_ans,
            correct_answer=q.correct_answer,
            is_correct=is_corr,
            explanation=q.explanation,
            points_earned=pts
        ))

    percentage = round((earned_points / max(1, total_points)) * 100, 1)
    passed = percentage >= assessment.passing_score

    # Get previous learner skill
    learner_skill = db.query(LearnerSkill).filter(
        LearnerSkill.profile_id == profile.id,
        LearnerSkill.skill_id == assessment.skill_id
    ).first()
    prev_prof = learner_skill.current_proficiency if learner_skill else 20.0
    prev_conf = learner_skill.confidence_score if learner_skill else 0.4

    # Create attempt
    attempt = AssessmentAttempt(
        profile_id=profile.id,
        assessment_id=assessment.id,
        score=earned_points,
        max_score=total_points,
        percentage=percentage,
        passed=passed,
        answers_json=json.dumps(req.answers),
        created_at=datetime.datetime.utcnow()
    )
    db.add(attempt)
    db.flush()

    # Trigger Adaptive Engine
    adapt_result = adapt_roadmap_after_assessment(db, attempt, weak_topics)
    db.refresh(learner_skill) if learner_skill else None
    
    new_prof = learner_skill.current_proficiency if learner_skill else percentage
    new_conf = learner_skill.confidence_score if learner_skill else 0.6
    delta = round(new_prof - prev_prof, 1)

    attempt.skill_delta = delta
    attempt.feedback_advice = adapt_result.get("advice")
    db.commit()

    return AssessmentResultResponse(
        attempt_id=attempt.id,
        assessment_id=assessment.id,
        assessment_title=assessment.title,
        skill_name=assessment.skill.name if assessment.skill else "Skill",
        score=earned_points,
        max_score=total_points,
        percentage=percentage,
        passed=passed,
        previous_proficiency=prev_prof,
        new_proficiency=new_prof,
        proficiency_delta=delta,
        previous_confidence=prev_conf,
        new_confidence=new_conf,
        ai_feedback_advice=adapt_result.get("advice", "Assessment recorded."),
        adaptive_action_taken=adapt_result.get("adaptive_action", "Roadmap updated."),
        question_results=question_results
    )
