from sqlalchemy.orm import Session
from app.models.models import LearnerProfile, Feedback, AIInsight
from app.schemas.schemas import FeedbackCreate

class FeedbackService:
    @staticmethod
    def record_feedback(db: Session, data: FeedbackCreate) -> Feedback:
        profile = db.query(LearnerProfile).filter(LearnerProfile.id == data.profile_id).first()
        if not profile:
            profile = db.query(LearnerProfile).first()

        fb = Feedback(
            profile_id=profile.id,
            resource_id=data.resource_id,
            difficulty_feedback=data.difficulty_feedback,
            next_preference=data.next_preference,
            comment=data.comment
        )
        db.add(fb)

        if data.difficulty_feedback == "Too Difficult":
            db.add(AIInsight(
                profile_id=profile.id,
                insight_type="Recommendation",
                message="Adjusted recommendation engine to prioritize visual and hands-on walkthroughs following difficulty feedback.",
                importance="Medium"
            ))
        elif data.difficulty_feedback == "Too Easy":
            db.add(AIInsight(
                profile_id=profile.id,
                insight_type="Milestone",
                message="Paced acceleration enabled: Introductory review bypassed for fast-track progression.",
                importance="Low"
            ))

        db.commit()
        db.refresh(fb)
        return fb
