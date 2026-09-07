from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import LearnerProfile
from app.schemas.schemas import SkillGapResponse, SkillDetailResponse
from app.services.skill_gap_service import SkillGapService

router = APIRouter()

@router.get("/skill-gap/analyze", response_model=SkillGapResponse)
def analyze_skill_gap(profile_id: Optional[int] = None, db: Session = Depends(get_db)):
    if profile_id:
        profile = db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
    else:
        profile = db.query(LearnerProfile).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Learner profile not found.")

    return SkillGapService.analyze_skill_gaps(db, profile)

@router.get("/skill-gap/skill/{skill_id}", response_model=SkillDetailResponse)
def get_skill_detail(skill_id: int, profile_id: Optional[int] = None, db: Session = Depends(get_db)):
    if profile_id:
        profile = db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
    else:
        profile = db.query(LearnerProfile).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Learner profile not found.")

    detail = SkillGapService.get_skill_detail(db, profile, skill_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Skill with ID {skill_id} not found.")

    return detail

