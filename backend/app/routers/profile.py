from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import (
    LearnerProfileCreate, LearnerProfileRead, LearnerProfileUpdate,
    GoalAnalyzeRequest, ExtractedGoalInfo
)
from app.services.profile_service import ProfileService
from app.api.endpoints.profile import format_profile_read

router = APIRouter()

@router.post("/analyze-goal", response_model=ExtractedGoalInfo)
def analyze_career_goal(req: GoalAnalyzeRequest, db: Session = Depends(get_db)):
    return ProfileService.parse_natural_goal(db, req.text)

@router.post("/profile", response_model=LearnerProfileRead)
def create_profile(data: LearnerProfileCreate, db: Session = Depends(get_db)):
    profile = ProfileService.create_or_init_profile(db, data)
    return format_profile_read(profile)

@router.get("/profile", response_model=LearnerProfileRead)
def get_profile(profile_id: Optional[int] = None, db: Session = Depends(get_db)):
    profile = ProfileService.get_profile(db, profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Learner profile not found.")
    return format_profile_read(profile)

@router.put("/profile/{profile_id}", response_model=LearnerProfileRead)
def update_profile(profile_id: int, data: LearnerProfileUpdate, db: Session = Depends(get_db)):
    profile = ProfileService.update_profile(db, profile_id, data)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")
    return format_profile_read(profile)
