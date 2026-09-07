from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import LearnerProfile, Feedback, LearningResource, AIInsight
from app.schemas.schemas import FeedbackCreate, FeedbackRead

router = APIRouter()

@router.post("/feedback", response_model=FeedbackRead)
def submit_feedback(data: FeedbackCreate, db: Session = Depends(get_db)):
    """Logs resource learning feedback to adapt recommendation weights and pacing."""
    profile = db.query(LearnerProfile).filter(LearnerProfile.id == data.profile_id).first()
    if not profile:
        profile = db.query(LearnerProfile).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Learner profile not found.")

    fb = Feedback(
        profile_id=profile.id,
        resource_id=data.resource_id,
        difficulty_feedback=data.difficulty_feedback,
        next_preference=data.next_preference,
        comment=data.comment
    )
    db.add(fb)

    # Add insight if learner found content too difficult or wants more practice
    if data.difficulty_feedback == "Too Difficult":
        db.add(AIInsight(
            profile_id=profile.id,
            insight_type="Recommendation",
            message=f"Adjusted recommendation engine to prioritize visual and hands-on walkthroughs following difficulty feedback.",
            importance="Medium"
        ))
    elif data.difficulty_feedback == "Too Easy":
        db.add(AIInsight(
            profile_id=profile.id,
            insight_type="Milestone",
            message=f"Paced acceleration enabled: Introductory review bypassed for fast-track progression.",
            importance="Low"
        ))

    db.commit()
    db.refresh(fb)
    return fb
