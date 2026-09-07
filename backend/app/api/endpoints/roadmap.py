from typing import Optional
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import LearnerProfile, Roadmap, RoadmapPhase, RoadmapItem
from app.schemas.schemas import (
    RoadmapRead, RoadmapGenerateRequest, RoadmapItemStatusUpdate,
    WhatIfRequest, WhatIfResponse
)
from app.services.roadmap_service import RoadmapService
from app.roadmap.what_if_simulator import simulate_roadmap_impact

router = APIRouter()

@router.get("/roadmap", response_model=RoadmapRead)
def get_roadmap(profile_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Retrieves the active personalized learning roadmap or generates one automatically."""
    if profile_id:
        profile = db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
    else:
        profile = db.query(LearnerProfile).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Learner profile not found.")

    roadmap = RoadmapService.get_or_generate_roadmap(db, profile, force_regenerate=False)
    return RoadmapService.format_roadmap_response(roadmap)

@router.post("/roadmap/generate", response_model=RoadmapRead)
def generate_roadmap(req: RoadmapGenerateRequest, db: Session = Depends(get_db)):
    """Generates a fresh prerequisite-aware DAG roadmap for the learner."""
    profile = db.query(LearnerProfile).filter(LearnerProfile.id == req.profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Learner profile not found.")

    roadmap = RoadmapService.get_or_generate_roadmap(db, profile, force_regenerate=req.force_regenerate)
    return RoadmapService.format_roadmap_response(roadmap)

@router.put("/roadmap/item/status")
def update_item_status(data: RoadmapItemStatusUpdate, db: Session = Depends(get_db)):
    """Updates the progress status of a roadmap node (In Progress, Completed) and unlocks next items."""
    item = db.query(RoadmapItem).filter(RoadmapItem.id == data.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Roadmap item not found.")

    item.status = data.status
    if data.status == "Completed":
        item.completed_at = datetime.datetime.utcnow()
        # Unlock next item in the same phase
        next_item = db.query(RoadmapItem).filter(
            RoadmapItem.phase_id == item.phase_id,
            RoadmapItem.order_index == item.order_index + 1
        ).first()
        if next_item and next_item.status == "Locked":
            next_item.status = "Available"
            next_item.unlocked_at = datetime.datetime.utcnow()

        # Check if entire phase is completed
        phase = item.phase
        if phase and all(i.status == "Completed" for i in phase.items):
            phase.status = "Completed"
            # Unlock next phase
            next_phase = db.query(RoadmapPhase).filter(
                RoadmapPhase.roadmap_id == phase.roadmap_id,
                RoadmapPhase.phase_number == phase.phase_number + 1
            ).first()
            if next_phase:
                next_phase.status = "In Progress"
                for npi in next_phase.items:
                    if npi.order_index == 0:
                        npi.status = "Available"
                        npi.unlocked_at = datetime.datetime.utcnow()

    db.commit()
    return {"success": True, "item_id": item.id, "new_status": item.status}

@router.post("/roadmap/what-if", response_model=WhatIfResponse)
def simulate_what_if(req: WhatIfRequest, db: Session = Depends(get_db)):
    """
    Simulates the impact of changing study hours, focus modes, or target deadlines
    on the overall roadmap timeline and phase duration.
    """
    profile = db.query(LearnerProfile).filter(LearnerProfile.id == req.profile_id).first()
    if not profile:
        profile = db.query(LearnerProfile).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Learner profile not found.")

    roadmap = db.query(Roadmap).filter(
        Roadmap.profile_id == profile.id,
        Roadmap.is_active == True
    ).first()

    if not roadmap:
        roadmap = RoadmapService.get_or_generate_roadmap(db, profile)

    return simulate_roadmap_impact(profile, roadmap, req)
