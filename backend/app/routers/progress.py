from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import LearnerProfile
from app.schemas.schemas import (
    DashboardResponse, ProjectRead,
    SkillMomentumResponse, LearningVelocityResponse, SmartStreakResponse,
    GoalDistanceResponse, DailyPlanResponse, AchievementResponse
)
from app.services.dashboard_service import DashboardService
from app.services.progress_service import ProgressService
from app.services.insight_service import InsightService
from app.services.analytics_service import AnalyticsService

router = APIRouter()

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(profile_id: Optional[int] = None, db: Session = Depends(get_db)):
    if profile_id:
        profile = db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
    else:
        profile = db.query(LearnerProfile).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Learner profile not found.")

    return DashboardService.get_dashboard(db, profile)

@router.get("/analytics/momentum", response_model=SkillMomentumResponse)
def get_skill_momentum(profile_id: Optional[int] = None, db: Session = Depends(get_db)):
    profile = db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first() if profile_id else db.query(LearnerProfile).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Learner profile not found.")
    return AnalyticsService.get_skill_momentum(db, profile)

@router.get("/analytics/velocity", response_model=LearningVelocityResponse)
def get_learning_velocity(profile_id: Optional[int] = None, db: Session = Depends(get_db)):
    profile = db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first() if profile_id else db.query(LearnerProfile).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Learner profile not found.")
    return AnalyticsService.get_learning_velocity(db, profile)

@router.get("/analytics/smart-streak", response_model=SmartStreakResponse)
def get_smart_streak(profile_id: Optional[int] = None, db: Session = Depends(get_db)):
    profile = db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first() if profile_id else db.query(LearnerProfile).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Learner profile not found.")
    return AnalyticsService.get_smart_streak(db, profile)

@router.get("/analytics/goal-distance", response_model=GoalDistanceResponse)
def get_goal_distance(profile_id: Optional[int] = None, db: Session = Depends(get_db)):
    profile = db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first() if profile_id else db.query(LearnerProfile).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Learner profile not found.")
    return AnalyticsService.get_goal_distance(db, profile)

@router.get("/analytics/daily-plan", response_model=DailyPlanResponse)
def get_daily_plan(profile_id: Optional[int] = None, db: Session = Depends(get_db)):
    profile = db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first() if profile_id else db.query(LearnerProfile).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Learner profile not found.")
    return AnalyticsService.get_daily_plan(db, profile)

@router.get("/analytics/achievements", response_model=AchievementResponse)
def get_achievements(profile_id: Optional[int] = None, db: Session = Depends(get_db)):
    profile = db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first() if profile_id else db.query(LearnerProfile).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Learner profile not found.")
    return AnalyticsService.get_achievements(db, profile)

@router.get("/insights")
def get_ai_insights(profile_id: Optional[int] = None, db: Session = Depends(get_db)):
    if profile_id:
        profile = db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
    else:
        profile = db.query(LearnerProfile).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Learner profile not found.")

    return InsightService.get_learner_insights(db, profile)

@router.get("/projects", response_model=List[ProjectRead])
def get_projects(db: Session = Depends(get_db)):
    return ProgressService.get_all_projects(db)
