from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.models import AssessmentAttempt
from app.roadmap.adaptive_engine import adapt_roadmap_after_assessment

class AdaptationService:
    @staticmethod
    def trigger_assessment_adaptation(
        db: Session,
        attempt: AssessmentAttempt,
        weak_topics: List[str] = []
    ) -> Dict[str, Any]:
        return adapt_roadmap_after_assessment(db, attempt, weak_topics)
