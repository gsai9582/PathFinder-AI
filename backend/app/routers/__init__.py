from app.routers.profile import router as profile_router
from app.routers.career import router as career_router
from app.routers.skill_gap import router as skill_gap_router
from app.routers.recommendation import router as recommendation_router
from app.routers.roadmap import router as roadmap_router
from app.routers.assessment import router as assessment_router
from app.routers.project import router as project_router
from app.routers.feedback import router as feedback_router
from app.routers.progress import router as progress_router
from app.routers.chat import router as chat_router
from app.routers.demo import router as demo_router

__all__ = [
    "profile_router",
    "career_router",
    "skill_gap_router",
    "recommendation_router",
    "roadmap_router",
    "assessment_router",
    "project_router",
    "feedback_router",
    "progress_router",
    "chat_router",
    "demo_router"
]
