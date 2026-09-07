from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, LearnerProfile, CareerGoal
from app.schemas.schemas import LearnerProfileRead
from app.api.endpoints.profile import format_profile_read
from app.services.roadmap_service import RoadmapService

router = APIRouter()

@router.post("/demo/init", response_model=LearnerProfileRead)
def initialize_demo_learner(db: Session = Depends(get_db)):
    """
    Initializes or resets the Demo Learner ('Alex Morgan' - AI/ML Engineer track)
    with a fully populated state for a high-impact hackathon presentation.
    """
    user = db.query(User).filter(User.email == "alex.demo@pathfinder.ai").first()
    if not user:
        # If not present for any reason, find first profile
        profile = db.query(LearnerProfile).first()
    else:
        profile = user.profile

    if profile:
        # Ensure active roadmap exists
        RoadmapService.get_or_generate_roadmap(db, profile, force_regenerate=False)
        return format_profile_read(profile)

    # Fallback
    profile = db.query(LearnerProfile).first()
    return format_profile_read(profile)
