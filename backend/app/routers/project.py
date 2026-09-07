from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import (
    ProjectRead, ProjectRecommendationResponse, ProjectDetailResponse
)
from app.services.project_service import ProjectService

router = APIRouter()

@router.get("/projects", response_model=List[ProjectRead])
def list_projects(
    difficulty: Optional[str] = Query(None, description="Filter by difficulty: Beginner, Intermediate, Advanced, All"),
    skill_id: Optional[int] = Query(None, description="Filter by primary skill ID"),
    db: Session = Depends(get_db)
):
    return ProjectService.list_projects(db, difficulty, skill_id)

@router.get("/projects/recommendations", response_model=ProjectRecommendationResponse)
def get_project_recommendations(
    profile_id: Optional[int] = Query(None, description="Learner Profile ID"),
    db: Session = Depends(get_db)
):
    return ProjectService.get_recommendations(db, profile_id)

@router.get("/projects/{project_id}", response_model=ProjectDetailResponse)
def get_project_detail(
    project_id: int,
    profile_id: Optional[int] = Query(None, description="Learner Profile ID"),
    db: Session = Depends(get_db)
):
    detail = ProjectService.get_project_details(db, project_id, profile_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Project not found")
    return detail
