import json
import datetime
from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from app.models.models import (
    LearnerProfile, Assessment, Question, AssessmentAttempt, LearnerSkill, Skill
)
from app.schemas.schemas import (
    AssessmentRead, QuestionRead, AssessmentSubmitRequest, AssessmentResultResponse, QuestionResult,
    AssessmentGenerateRequest
)
from app.ai.factory import get_ai_provider
from app.roadmap.adaptive_engine import adapt_roadmap_after_assessment

class AssessmentService:
    @staticmethod
    def list_assessments(db: Session, skill_id: Optional[int] = None) -> List[AssessmentRead]:
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

    @staticmethod
    def get_assessment(db: Session, assessment_id: int) -> Optional[AssessmentRead]:
        assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            return None

        questions_read = []
        for q in assessment.questions:
            try:
                options = json.loads(q.options_json)
            except Exception:
                options = ["Option A", "Option B", "Option C", "Option D"]
            questions_read.append(QuestionRead(
                id=q.id,
                question_text=q.question_text,
                question_type=q.question_type or "multiple_choice",
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

    @staticmethod
    def generate_assessment(db: Session, req: AssessmentGenerateRequest) -> AssessmentRead:
        skill = None
        if req.skill_id:
            skill = db.query(Skill).filter(Skill.id == req.skill_id).first()
        elif req.skill_name:
            skill = db.query(Skill).filter(Skill.name.ilike(f"%{req.skill_name}%")).first()

        if not skill:
            skill = db.query(Skill).first()

        skill_name = skill.name if skill else (req.skill_name or "Machine Learning")
        ai = get_ai_provider()
        ai_data = ai.generate_assessment(
            skill_name=skill_name,
            difficulty=req.difficulty,
            career_goal=req.career_goal or "AI/ML Engineer",
            question_count=req.question_count
        )

        # Create persistent Assessment entity in DB
        new_assessment = Assessment(
            title=ai_data.get("title", f"{skill_name} Diagnostic ({req.difficulty})"),
            skill_id=skill.id if skill else 1,
            difficulty=req.difficulty,
            passing_score=ai_data.get("passing_score", 70.0),
            description=ai_data.get("description", "AI-generated diagnostic assessment.")
        )
        db.add(new_assessment)
        db.flush()

        questions_read = []
        for q in ai_data.get("questions", []):
            opts = q.get("options", ["Option A", "Option B", "Option C", "Option D"])
            new_q = Question(
                assessment_id=new_assessment.id,
                question_text=q.get("text", "Question prompt"),
                question_type=q.get("type", "multiple_choice"),
                options_json=json.dumps(opts),
                correct_answer=q.get("correct", opts[0]),
                explanation=q.get("explanation", "Correct answer verified by PathFinder AI."),
                points=10
            )
            db.add(new_q)
            db.flush()

            questions_read.append(QuestionRead(
                id=new_q.id,
                question_text=new_q.question_text,
                question_type=new_q.question_type,
                options=opts,
                points=new_q.points
            ))

        db.commit()

        return AssessmentRead(
            id=new_assessment.id,
            title=new_assessment.title,
            skill_id=new_assessment.skill_id,
            skill_name=skill_name,
            difficulty=new_assessment.difficulty,
            passing_score=new_assessment.passing_score,
            description=new_assessment.description,
            questions_count=len(questions_read),
            questions=questions_read
        )

    @staticmethod
    def submit_assessment(db: Session, req: AssessmentSubmitRequest) -> Optional[AssessmentResultResponse]:
        assessment = db.query(Assessment).filter(Assessment.id == req.assessment_id).first()
        if not assessment:
            return None

        profile = db.query(LearnerProfile).filter(LearnerProfile.id == req.profile_id).first()
        if not profile:
            profile = db.query(LearnerProfile).first()
        if not profile:
            return None

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
                weak_topics.append(q.question_text[:50] + "...")

            question_results.append(QuestionResult(
                question_id=q.id,
                question_text=q.question_text,
                question_type=q.question_type or "multiple_choice",
                user_answer=user_ans,
                correct_answer=q.correct_answer,
                is_correct=is_corr,
                explanation=q.explanation,
                points_earned=pts
            ))

        percentage = round((earned_points / max(1, total_points)) * 100, 1)
        passed = percentage >= assessment.passing_score

        learner_skill = db.query(LearnerSkill).filter(
            LearnerSkill.profile_id == profile.id,
            LearnerSkill.skill_id == assessment.skill_id
        ).first()
        prev_prof = learner_skill.current_proficiency if learner_skill else 20.0
        prev_conf = learner_skill.confidence_score if learner_skill else 0.4

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

        adapt_result = adapt_roadmap_after_assessment(db, attempt, weak_topics)
        db.refresh(learner_skill) if learner_skill else None

        new_prof = learner_skill.current_proficiency if learner_skill else percentage
        new_conf = learner_skill.confidence_score if learner_skill else 0.6
        delta = round(new_prof - prev_prof, 1)

        # Generate specific recommended action
        skill_name_clean = assessment.skill.name if assessment.skill else "topic"
        if percentage < 50:
            recommended_action = f"Review fundamental {skill_name_clean} prerequisites and retry diagnostic before advancing."
        elif percentage < 75:
            topic_hint = weak_topics[0] if weak_topics else f"{skill_name_clean} core metrics"
            recommended_action = f"Review {topic_hint} before continuing to advanced projects."
        else:
            recommended_action = f"Mastery verified in {skill_name_clean}. Ready to proceed with hands-on milestone projects."

        attempt.skill_delta = delta
        attempt.feedback_advice = adapt_result.get("advice")
        db.commit()

        return AssessmentResultResponse(
            attempt_id=attempt.id,
            assessment_id=assessment.id,
            assessment_title=assessment.title,
            skill_name=skill_name_clean,
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
            recommended_action=recommended_action,
            adaptive_action_taken=adapt_result.get("adaptive_action", "Roadmap updated."),
            question_results=question_results
        )
