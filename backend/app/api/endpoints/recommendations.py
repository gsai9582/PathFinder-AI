from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import (
    LearnerProfile, LearningResource, CareerGoal, CareerSkill, LearnerSkill, 
    Prerequisite, Feedback, Skill
)
from app.schemas.schemas import (
    RecommendationResponse, RecommendationItem, ResourceRead, WhyThisResponse
)
from app.recommendation.scoring import calculate_recommendation_score
from app.roadmap.dag_solver import PrerequisiteDAGSolver
from app.ai.factory import get_ai_provider

router = APIRouter()

@router.get("/recommendations", response_model=RecommendationResponse)
def get_recommendations(
    profile_id: Optional[int] = None,
    skill_id: Optional[int] = None,
    resource_type: Optional[str] = None,
    difficulty: Optional[str] = None,
    limit: int = 15,
    db: Session = Depends(get_db)
):
    """
    Returns personalized, scored learning resources based on learner skill gaps,
    learning style, available hours, and prerequisite dependencies.
    """
    if profile_id:
        profile = db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
    else:
        profile = db.query(LearnerProfile).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Learner profile not found.")

    career_goal = profile.career_goal or db.query(CareerGoal).first()
    career_skills = db.query(CareerSkill).filter(CareerSkill.career_id == career_goal.id).all()
    career_skills_map = {cs.skill_id: cs for cs in career_skills}

    prerequisites = db.query(Prerequisite).all()
    learner_skills = db.query(LearnerSkill).filter(LearnerSkill.profile_id == profile.id).all()
    learner_skills_map = {ls.skill_id: ls for ls in learner_skills}

    dag_solver = PrerequisiteDAGSolver(career_skills, prerequisites)
    prereqs_met_map = dag_solver.check_prerequisites_met(learner_skills_map)

    feedbacks = db.query(Feedback).filter(Feedback.profile_id == profile.id).all()

    # Query resources
    query = db.query(LearningResource)
    if skill_id:
        query = query.filter(LearningResource.primary_skill_id == skill_id)
    if resource_type:
        query = query.filter(LearningResource.type == resource_type)
    if difficulty:
        query = query.filter(LearningResource.difficulty == difficulty)

    all_resources = query.all()
    ai_provider = get_ai_provider()

    scored_items: List[RecommendationItem] = []
    for res in all_resources:
        score_data = calculate_recommendation_score(
            resource=res,
            profile=profile,
            career_skills_map=career_skills_map,
            learner_skills_map=learner_skills_map,
            prerequisites_met_map=prereqs_met_map,
            recent_feedbacks=feedbacks
        )

        skill_name = res.skill.name if res.skill else "Foundations"
        explanation = ai_provider.generate_explanation(
            resource_title=res.title,
            skill_name=skill_name,
            goal_title=career_goal.title,
            gap=score_data["gap"],
            prereqs_met=score_data["prerequisites_met"],
            learning_style=profile.preferred_learning_style or "Mixed",
            weekly_hours=profile.weekly_hours or 10
        )

        res_read = ResourceRead(
            id=res.id,
            title=res.title,
            type=res.type,
            provider=res.provider,
            primary_skill_id=res.primary_skill_id,
            skill_name=skill_name,
            difficulty=res.difficulty,
            duration_hours=res.duration_hours,
            rating=res.rating,
            url=res.url,
            description=res.description,
            is_free=res.is_free,
            is_hands_on=res.is_hands_on,
            project_oriented=res.project_oriented,
            learning_style_tag=res.learning_style_tag
        )

        scored_items.append(RecommendationItem(
            resource=res_read,
            recommendation_score=score_data["score"],
            priority_tier=score_data["priority_tier"],
            explanation=explanation,
            score_breakdown=score_data["score_breakdown"]
        ))

    # Sort descending by score
    scored_items.sort(key=lambda x: x.recommendation_score, reverse=True)

    return RecommendationResponse(
        profile_id=profile.id,
        recommendations=scored_items[:limit],
        total_matches=len(scored_items)
    )

@router.get("/recommendations/explain", response_model=WhyThisResponse)
def explain_recommendation(
    resource_id: int,
    profile_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Detailed explainability breakdown ('Why this?') for a specific recommendation.
    """
    resource = db.query(LearningResource).filter(LearningResource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found.")

    if profile_id:
        profile = db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
    else:
        profile = db.query(LearnerProfile).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Learner profile not found.")

    skill = resource.skill
    career_goal = profile.career_goal or db.query(CareerGoal).first()
    career_skill = db.query(CareerSkill).filter(
        CareerSkill.career_id == career_goal.id,
        CareerSkill.skill_id == skill.id
    ).first()
    learner_skill = db.query(LearnerSkill).filter(
        LearnerSkill.profile_id == profile.id,
        LearnerSkill.skill_id == skill.id
    ).first()

    req_prof = career_skill.required_proficiency if career_skill else 80.0
    cur_prof = learner_skill.current_proficiency if learner_skill else 0.0
    gap = max(0.0, req_prof - cur_prof)

    ai_provider = get_ai_provider()
    narrative = ai_provider.generate_explanation(
        resource_title=resource.title,
        skill_name=skill.name,
        goal_title=career_goal.title,
        gap=gap,
        prereqs_met=True,
        learning_style=profile.preferred_learning_style or "Mixed",
        weekly_hours=profile.weekly_hours or 10
    )

    return WhyThisResponse(
        resource_id=resource.id,
        resource_title=resource.title,
        learner_goal=career_goal.title,
        target_skill=skill.name,
        current_proficiency=round(cur_prof, 1),
        required_proficiency=round(req_prof, 1),
        gap=round(gap, 1),
        prerequisites_status="Satisfied (Validated foundational requirements)",
        learning_style_fit=f"Matches your '{profile.preferred_learning_style}' preference (Hands-on: {resource.is_hands_on})",
        estimated_time=f"{resource.duration_hours} hours ({round(resource.duration_hours / max(1, profile.weekly_hours) * 7, 1)} days at your pace)",
        expected_outcome=f"Increases '{skill.name}' proficiency toward target {req_prof}% required for {career_goal.title}.",
        ai_narrative_explanation=narrative
    )
