from typing import List, Optional
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, LearnerProfile, CareerGoal, Skill, LearnerSkill, CareerSkill
from app.schemas.schemas import (
    LearnerProfileCreate, LearnerProfileRead, LearnerProfileUpdate,
    GoalAnalyzeRequest, ExtractedGoalInfo
)
from app.ai.factory import get_ai_provider

router = APIRouter()

@router.post("/analyze-goal", response_model=ExtractedGoalInfo)
def analyze_career_goal(req: GoalAnalyzeRequest, db: Session = Depends(get_db)):
    """Parses free-form natural language goal input into structured data using AI/NLP."""
    ai_provider = get_ai_provider()
    extracted = ai_provider.analyze_career_goal(req.text)

    # Match career goal in database
    career_name = extracted.get("career_goal", "AI/ML Engineer")
    career = db.query(CareerGoal).filter(CareerGoal.title.ilike(f"%{career_name}%")).first()
    if not career:
        career = db.query(CareerGoal).first()

    return ExtractedGoalInfo(
        career_goal=career.title if career else career_name,
        career_goal_id=career.id if career else 1,
        experience_level=extracted.get("experience_level", "Intermediate"),
        target_timeline_months=extracted.get("target_timeline_months", 6),
        extracted_skills=extracted.get("extracted_skills", ["Python", "SQL"]),
        weak_areas=extracted.get("weak_areas", ["Statistics", "Machine Learning"]),
        preferred_learning_style=extracted.get("preferred_learning_style", "Mixed"),
        weekly_hours=extracted.get("weekly_hours", 10),
        ai_summary=extracted.get("ai_summary", "Custom career pathway parsed."),
        confidence=extracted.get("confidence", 0.92)
    )

@router.post("/profile", response_model=LearnerProfileRead)
def create_profile(data: LearnerProfileCreate, db: Session = Depends(get_db)):
    """Creates or initializes a learner profile."""
    # Check or create user
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        user = User(email=data.email, full_name=data.full_name)
        db.add(user)
        db.flush()

    # Get career goal
    career_goal = None
    if data.career_goal_id:
        career_goal = db.query(CareerGoal).filter(CareerGoal.id == data.career_goal_id).first()
    if not career_goal:
        career_goal = db.query(CareerGoal).first()

    profile = db.query(LearnerProfile).filter(LearnerProfile.user_id == user.id).first()
    if not profile:
        profile = LearnerProfile(
            user_id=user.id,
            career_goal_id=career_goal.id if career_goal else None,
            custom_goal_text=data.custom_goal_text,
            experience_level=data.experience_level,
            weekly_hours=data.weekly_hours,
            target_timeline_months=data.target_timeline_months,
            preferred_learning_style=data.preferred_learning_style,
            completed_courses_text=data.completed_courses_text,
            interests_text=data.interests_text,
            ai_understanding_summary=f"Profile initialized for {career_goal.title if career_goal else 'learning pathway'}. Personalized skill-gap roadmap is ready for generation."
        )
        db.add(profile)
        db.flush()

    # Add provided skills
    if data.skills:
        for sk_data in data.skills:
            skill_id = sk_data.get("skill_id")
            if not skill_id and "skill_name" in sk_data:
                sk_obj = db.query(Skill).filter(Skill.name.ilike(sk_data["skill_name"])).first()
                if sk_obj:
                    skill_id = sk_obj.id

            if skill_id:
                prof = float(sk_data.get("current_proficiency", 50.0))
                ls = db.query(LearnerSkill).filter(
                    LearnerSkill.profile_id == profile.id,
                    LearnerSkill.skill_id == skill_id
                ).first()
                if not ls:
                    db.add(LearnerSkill(
                        profile_id=profile.id,
                        skill_id=skill_id,
                        current_proficiency=prof,
                        confidence_score=0.7,
                        source="self_reported"
                    ))
                else:
                    ls.current_proficiency = prof

    db.commit()
    db.refresh(profile)
    return format_profile_read(profile)

@router.get("/profile", response_model=LearnerProfileRead)
def get_profile(profile_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Retrieves learner profile by ID or returns the active/demo profile."""
    if profile_id:
        profile = db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
    else:
        profile = db.query(LearnerProfile).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Learner profile not found.")

    return format_profile_read(profile)

@router.put("/profile/{profile_id}", response_model=LearnerProfileRead)
def update_profile(profile_id: int, data: LearnerProfileUpdate, db: Session = Depends(get_db)):
    """Updates learner profile parameters and skills."""
    profile = db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")

    if data.career_goal_id is not None:
        profile.career_goal_id = data.career_goal_id
    if data.experience_level is not None:
        profile.experience_level = data.experience_level
    if data.weekly_hours is not None:
        profile.weekly_hours = data.weekly_hours
    if data.target_timeline_months is not None:
        profile.target_timeline_months = data.target_timeline_months
    if data.preferred_learning_style is not None:
        profile.preferred_learning_style = data.preferred_learning_style
    if data.custom_goal_text is not None:
        profile.custom_goal_text = data.custom_goal_text
    if data.interests_text is not None:
        profile.interests_text = data.interests_text

    if data.skills is not None:
        for s in data.skills:
            sid = s.get("skill_id")
            prof = float(s.get("current_proficiency", 50.0))
            if sid:
                ls = db.query(LearnerSkill).filter(
                    LearnerSkill.profile_id == profile.id,
                    LearnerSkill.skill_id == sid
                ).first()
                if ls:
                    ls.current_proficiency = prof
                else:
                    db.add(LearnerSkill(
                        profile_id=profile.id,
                        skill_id=sid,
                        current_proficiency=prof,
                        confidence_score=0.7,
                        source="self_reported"
                    ))

    db.commit()
    db.refresh(profile)
    return format_profile_read(profile)

def format_profile_read(profile: LearnerProfile) -> LearnerProfileRead:
    skills_read = []
    for ls in profile.skills:
        if ls.skill:
            skills_read.append({
                "id": ls.id,
                "skill_id": ls.skill_id,
                "skill_name": ls.skill.name,
                "category": ls.skill.category,
                "current_proficiency": ls.current_proficiency,
                "confidence_score": ls.confidence_score,
                "last_assessed_at": ls.last_assessed_at
            })

    return LearnerProfileRead(
        id=profile.id,
        user_id=profile.user_id,
        full_name=profile.user.full_name if profile.user else "Learner",
        email=profile.user.email if profile.user else "",
        career_goal_id=profile.career_goal_id,
        career_goal_title=profile.career_goal.title if profile.career_goal else None,
        custom_goal_text=profile.custom_goal_text,
        experience_level=profile.experience_level,
        weekly_hours=profile.weekly_hours,
        target_timeline_months=profile.target_timeline_months,
        preferred_learning_style=profile.preferred_learning_style,
        completed_courses_text=profile.completed_courses_text,
        interests_text=profile.interests_text,
        ai_understanding_summary=profile.ai_understanding_summary,
        skills=skills_read,
        created_at=profile.created_at,
        updated_at=profile.updated_at
    )
