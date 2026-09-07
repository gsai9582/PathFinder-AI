from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import LearnerProfile, CareerGoal, Skill, CareerSkill
from app.schemas.schemas import SkillGapResponse, SkillRead, CareerGoalRead
from app.services.skill_gap_service import SkillGapService

router = APIRouter()

@router.get("/skills", response_model=List[SkillRead])
def get_all_skills(category: Optional[str] = None, db: Session = Depends(get_db)):
    """Retrieves all recognized skills, optionally filtered by category."""
    query = db.query(Skill)
    if category:
        query = query.filter(Skill.category == category)
    return query.all()

@router.get("/careers", response_model=List[CareerGoalRead])
def get_all_careers(db: Session = Depends(get_db)):
    """Retrieves available career paths with required skill profiles."""
    careers = db.query(CareerGoal).all()
    results = []
    for c in careers:
        skills_info = []
        for cs in c.career_skills:
            skills_info.append({
                "skill_id": cs.skill_id,
                "skill_name": cs.skill.name,
                "required_proficiency": cs.required_proficiency,
                "priority_tier": cs.priority_tier
            })
        results.append(CareerGoalRead(
            id=c.id,
            title=c.title,
            slug=c.slug,
            description=c.description,
            category=c.category,
            required_experience_level=c.required_experience_level,
            avg_salary=c.avg_salary,
            market_demand=c.market_demand,
            skills=skills_info
        ))
    return results

@router.get("/skill-gap/analyze", response_model=SkillGapResponse)
def analyze_skill_gap(profile_id: Optional[int] = None, db: Session = Depends(get_db)):
    """
    Computes comprehensive skill-gap analysis, radar chart metrics,
    and priority tiers (Critical, Developing, Strong).
    """
    if profile_id:
        profile = db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
    else:
        profile = db.query(LearnerProfile).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Learner profile not found.")

    return SkillGapService.analyze_skill_gaps(db, profile)
