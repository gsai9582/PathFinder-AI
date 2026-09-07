from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.repositories.seed_data import seed_database
from app.utils.logger import logger

from app.routers import (
    profile_router,
    career_router,
    skill_gap_router,
    recommendation_router,
    roadmap_router,
    assessment_router,
    project_router,
    feedback_router,
    progress_router,
    chat_router,
    demo_router
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize tables
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    
    # Run database seed
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    
    yield
    logger.info("Shutting down PathFinder application...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent personalized learning path recommender with DAG prerequisite solving and adaptive learning.",
    lifespan=lifespan
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. PathFinder intelligent fallback is active."}
    )

# Register API Routers
api_v1 = settings.API_V1_STR
app.include_router(profile_router, prefix=api_v1, tags=["Profile & Onboarding"])
app.include_router(career_router, prefix=api_v1, tags=["Careers & Taxonomy"])
app.include_router(skill_gap_router, prefix=api_v1, tags=["Skill-Gap Analysis"])
app.include_router(recommendation_router, prefix=api_v1, tags=["Recommendations"])
app.include_router(roadmap_router, prefix=api_v1, tags=["Roadmap & Simulation"])
app.include_router(assessment_router, prefix=api_v1, tags=["Assessments"])
app.include_router(project_router, prefix=api_v1, tags=["Projects"])
app.include_router(feedback_router, prefix=api_v1, tags=["Feedback"])
app.include_router(progress_router, prefix=api_v1, tags=["Progress & Analytics"])
app.include_router(chat_router, prefix=api_v1, tags=["AI Learning Assistant"])
app.include_router(demo_router, prefix=api_v1, tags=["Demo Mode"])

@app.get("/")
def root():
    return {
        "app": "PathFinder API",
        "status": "online",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "tagline": "Your goal. Your gaps. Your personalized path."
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "ai_mode": "mock" if settings.USE_MOCK_AI or not settings.GEMINI_API_KEY else "gemini",
        "version": settings.VERSION
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
