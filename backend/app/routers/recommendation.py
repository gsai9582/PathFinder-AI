from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import LearnerProfile
from app.schemas.schemas import (
    RecommendationResponse, WhyThisResponse, RecommendationFilterRequest
)
from app.services.recommendation_service import RecommendationService

router = APIRouter()

@router.get("/recommendations", response_model=RecommendationResponse)
def get_recommendations(
    profile_id: Optional[int] = None,
    skill_id: Optional[int] = None,
    resource_type: Optional[str] = Query(None, description="All, Courses, Videos, Articles, Projects, Practice, Assessments"),
    difficulty: Optional[str] = None,
    search_query: Optional[str] = None,
    sort_by: Optional[str] = Query("Recommended", description="Recommended, Shortest, Highest Impact, Beginner Friendly"),
    limit: int = 20,
    db: Session = Depends(get_db)
):
    if profile_id:
        profile = db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
    else:
        profile = db.query(LearnerProfile).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Learner profile not found.")

    return RecommendationService.get_recommendations(
        db=db,
        profile=profile,
        skill_id=skill_id,
        resource_type=resource_type,
        difficulty=difficulty,
        search_query=search_query,
        sort_by=sort_by,
        limit=limit
    )

@router.post("/recommendations", response_model=RecommendationResponse)
def post_recommendations(
    payload: RecommendationFilterRequest,
    db: Session = Depends(get_db)
):
    if payload.profile_id:
        profile = db.query(LearnerProfile).filter(LearnerProfile.id == payload.profile_id).first()
    else:
        profile = db.query(LearnerProfile).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Learner profile not found.")

    return RecommendationService.get_recommendations(
        db=db,
        profile=profile,
        skill_id=payload.skill_id,
        resource_type=payload.resource_type,
        difficulty=payload.difficulty,
        search_query=payload.search_query,
        sort_by=payload.sort_by,
        limit=payload.limit
    )

@router.get("/recommendations/explain", response_model=WhyThisResponse)
def explain_recommendation(
    resource_id: int,
    profile_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    if profile_id:
        profile = db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
    else:
        profile = db.query(LearnerProfile).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Learner profile not found.")

    result = RecommendationService.explain_recommendation(db, profile, resource_id)
    if not result:
        raise HTTPException(status_code=404, detail="Resource not found.")
    return result
