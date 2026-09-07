from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import FeedbackCreate, FeedbackRead
from app.services.feedback_service import FeedbackService

router = APIRouter()

@router.post("/feedback", response_model=FeedbackRead)
def submit_feedback(data: FeedbackCreate, db: Session = Depends(get_db)):
    return FeedbackService.record_feedback(db, data)
