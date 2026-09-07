from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.models import LearnerProfile, AIInsight

class InsightService:
    @staticmethod
    def get_learner_insights(db: Session, profile: LearnerProfile) -> List[Dict[str, Any]]:
        insights = db.query(AIInsight).filter(AIInsight.profile_id == profile.id).order_by(AIInsight.created_at.desc()).all()
        return [
            {
                "id": i.id,
                "type": i.insight_type,
                "message": i.message,
                "importance": i.importance,
                "created_at": i.created_at
            }
            for i in insights
        ]
