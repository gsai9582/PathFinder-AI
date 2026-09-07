from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import LearnerProfile, AIInsight, Project
from app.schemas.schemas import DashboardResponse, ProjectRead
from app.services.analytics_service import AnalyticsService

router = APIRouter()

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(profile_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Retrieves full analytics dashboard data, career readiness score, and next best action."""
    if profile_id:
        profile = db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
    else:
        profile = db.query(LearnerProfile).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Learner profile not found.")

    return AnalyticsService.get_dashboard_data(db, profile)

@router.get("/insights")
def get_ai_insights(profile_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Retrieves list of personalized AI insights for the learner."""
    if profile_id:
        profile = db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
    else:
        profile = db.query(LearnerProfile).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Learner profile not found.")

    insights = db.query(AIInsight).filter(AIInsight.profile_id == profile.id).order_by(AIInsight.created_at.desc()).all()
    return [{"id": i.id, "type": i.insight_type, "message": i.message, "importance": i.importance, "created_at": i.created_at} for i in insights]

@router.get("/projects", response_model=List[ProjectRead])
def get_projects(db: Session = Depends(get_db)):
    """Retrieves all hands-on portfolio projects with tech stacks and learning objectives."""
    projects = db.query(Project).all()
    import json
    results = []
    for p in projects:
        try:
            objs = json.loads(p.learning_objectives_json)
        except Exception:
            objs = ["Build end-to-end model", "Evaluate performance"]
        try:
            tech = json.loads(p.tech_stack_json)
        except Exception:
            tech = ["Python", "FastAPI"]
        
        results.append(ProjectRead(
            id=p.id,
            title=p.title,
            slug=p.slug,
            difficulty=p.difficulty,
            primary_skill_id=p.primary_skill_id,
            skill_name=p.skill.name if p.skill else "Engineering",
            problem_statement=p.problem_statement,
            learning_objectives=objs,
            tech_stack=tech,
            estimated_hours=p.estimated_hours,
            expected_outcome=p.expected_outcome,
            template_repo_url=p.template_repo_url
        ))
    return results
