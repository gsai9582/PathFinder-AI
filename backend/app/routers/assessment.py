from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import (
    AssessmentRead, AssessmentSubmitRequest, AssessmentResultResponse, AssessmentGenerateRequest
)
from app.services.assessment_service import AssessmentService

router = APIRouter()

@router.get("/assessment/list", response_model=List[AssessmentRead])
@router.get("/assessments", response_model=List[AssessmentRead])
def list_assessments(skill_id: Optional[int] = None, db: Session = Depends(get_db)):
    return AssessmentService.list_assessments(db, skill_id)

@router.get("/assessment/{assessment_id}", response_model=AssessmentRead)
@router.get("/assessments/{assessment_id}", response_model=AssessmentRead)
def get_assessment_details(assessment_id: int, db: Session = Depends(get_db)):
    assessment = AssessmentService.get_assessment(db, assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")
    return assessment

@router.post("/assessment/generate", response_model=AssessmentRead)
@router.post("/assessments/generate", response_model=AssessmentRead)
def generate_assessment(req: AssessmentGenerateRequest, db: Session = Depends(get_db)):
    return AssessmentService.generate_assessment(db, req)

@router.post("/assessment/submit", response_model=AssessmentResultResponse)
@router.post("/assessments/submit", response_model=AssessmentResultResponse)
def submit_assessment(req: AssessmentSubmitRequest, db: Session = Depends(get_db)):
    result = AssessmentService.submit_assessment(db, req)
    if not result:
        raise HTTPException(status_code=404, detail="Assessment or profile not found.")
    return result
