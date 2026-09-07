from sqlalchemy.orm import Session
from app.models.models import LearnerProfile
from app.schemas.schemas import DashboardResponse
from app.services.analytics_service import AnalyticsService

class DashboardService:
    @staticmethod
    def get_dashboard(db: Session, profile: LearnerProfile) -> DashboardResponse:
        return AnalyticsService.get_dashboard_data(db, profile)
