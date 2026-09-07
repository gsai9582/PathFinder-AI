from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import CareerGoalRead, SkillRead, CareerGoalComparisonRequest, CareerGoalComparisonResponse
from app.services.career_service import CareerService

router = APIRouter()

@router.get("/careers", response_model=List[CareerGoalRead])
def get_all_careers(db: Session = Depends(get_db)):
    return CareerService.get_all_careers(db)

@router.get("/skills", response_model=List[SkillRead])
def get_all_skills(category: Optional[str] = None, db: Session = Depends(get_db)):
    return CareerService.get_all_skills(db, category)

@router.post("/career/compare", response_model=CareerGoalComparisonResponse)
def compare_career_goals(req: CareerGoalComparisonRequest, db: Session = Depends(get_db)):
    return CareerService.compare_career_goals(db, req.profile_id, req.target_goal_id, req.current_goal_id)
