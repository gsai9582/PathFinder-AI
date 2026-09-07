from typing import List, Optional, Set
from sqlalchemy.orm import Session
from app.models.models import (
    LearnerProfile, LearningResource, CareerGoal, CareerSkill, LearnerSkill, 
    Prerequisite, Feedback, RoadmapItem
)
from app.schemas.schemas import (
    RecommendationResponse, RecommendationItem, ResourceRead, WhyThisResponse, ScoreBreakdown
)
from app.recommendation.scoring import calculate_recommendation_score
from app.roadmap.dag_solver import PrerequisiteDAGSolver
from app.ai.factory import get_ai_provider

class RecommendationService:
    @staticmethod
    def get_recommendations(
        db: Session,
        profile: LearnerProfile,
        skill_id: Optional[int] = None,
        resource_type: Optional[str] = None,
        difficulty: Optional[str] = None,
        search_query: Optional[str] = None,
        sort_by: Optional[str] = "Recommended",
        limit: int = 20
    ) -> RecommendationResponse:
        career_goal = profile.career_goal or db.query(CareerGoal).first()
        career_skills = db.query(CareerSkill).filter(CareerSkill.career_id == career_goal.id).all()
        career_skills_map = {cs.skill_id: cs for cs in career_skills}

        prerequisites = db.query(Prerequisite).all()
        learner_skills = db.query(LearnerSkill).filter(LearnerSkill.profile_id == profile.id).all()
        learner_skills_map = {ls.skill_id: ls for ls in learner_skills}

        dag_solver = PrerequisiteDAGSolver(career_skills, prerequisites)
        prereqs_met_map = dag_solver.check_prerequisites_met(learner_skills_map)

        feedbacks = db.query(Feedback).filter(Feedback.profile_id == profile.id).all()

        # Find completed resources from roadmap items
        completed_items = db.query(RoadmapItem).filter(
            RoadmapItem.status == "Completed",
            RoadmapItem.resource_id.isnot(None)
        ).all()
        completed_res_ids: Set[int] = {item.resource_id for item in completed_items if item.resource_id}

        query = db.query(LearningResource)
        if skill_id:
            query = query.filter(LearningResource.primary_skill_id == skill_id)

        # Resource type filtering with category expansion
        if resource_type and resource_type.lower() != "all":
            rt = resource_type.lower()
            if rt == "courses":
                query = query.filter(LearningResource.type.in_(["Course", "Tutorial"]))
            elif rt == "videos":
                query = query.filter(LearningResource.type.in_(["Video"]))
            elif rt == "articles":
                query = query.filter(LearningResource.type.in_(["Article", "Documentation"]))
            elif rt == "projects":
                query = query.filter(LearningResource.type.in_(["Project", "Practice"]))
            elif rt == "practice":
                query = query.filter(LearningResource.type.in_(["Practice", "Tutorial"]))
            elif rt == "assessments":
                query = query.filter(LearningResource.type.in_(["Assessment"]))
            else:
                query = query.filter(LearningResource.type.ilike(f"%{resource_type}%"))

        if difficulty and difficulty.lower() != "all":
            query = query.filter(LearningResource.difficulty == difficulty)

        if search_query:
            search_pattern = f"%{search_query}%"
            query = query.filter(
                (LearningResource.title.ilike(search_pattern)) |
                (LearningResource.description.ilike(search_pattern)) |
                (LearningResource.provider.ilike(search_pattern))
            )

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
                recent_feedbacks=feedbacks,
                completed_resource_ids=completed_res_ids
            )

            skill_name = res.skill.name if res.skill else "Foundations"

            # Contextual Explanation considering career goal, skill gap, prerequisites, learning style, time, and performance
            gap = score_data["gap"]
            prereqs_met = score_data["prerequisites_met"]
            perf_note = "reinforced from your diagnostic assessment" if learner_skills_map.get(res.primary_skill_id) else "matches your target career track"
            
            if not prereqs_met:
                explanation = f"Parent prerequisites for {skill_name} are currently pending. Completing foundational topics will unlock this material."
            elif gap >= 40:
                explanation = f"{skill_name} is one of your largest remaining skill gaps (-{round(gap)}%) and is required for several upcoming {career_goal.title} topics. This {res.learning_style_tag.lower()} resource fits your {profile.weekly_hours}h/wk schedule."
            elif gap >= 20:
                explanation = f"Strengthens your developing {skill_name} proficiency (-{round(gap)}% gap). Direct alignment with your {profile.preferred_learning_style.lower()} learning style."
            else:
                explanation = f"Provides advanced mastery and project practice in {skill_name}, {perf_note}."

            res_read = ResourceRead.model_validate(res)
            res_read.skill_name = skill_name

            scored_items.append(RecommendationItem(
                resource=res_read,
                recommendation_score=score_data["score"],
                match_percentage=score_data["match_percentage"],
                priority_tier=score_data["priority_tier"],
                explanation=explanation,
                score_breakdown=score_data["score_breakdown"]
            ))

        # Sorting logic
        sort_mode = (sort_by or "Recommended").lower()
        if sort_mode == "shortest":
            scored_items.sort(key=lambda x: x.resource.duration_hours)
        elif sort_mode in ["highest impact", "highest_impact"]:
            scored_items.sort(
                key=lambda x: (x.score_breakdown.skill_gap_weight + x.score_breakdown.goal_relevance),
                reverse=True
            )
        elif sort_mode in ["beginner friendly", "beginner_friendly"]:
            diff_weights = {"Beginner": 3, "Intermediate": 2, "Advanced": 1}
            scored_items.sort(
                key=lambda x: (diff_weights.get(x.resource.difficulty, 2), x.recommendation_score),
                reverse=True
            )
        else:  # Recommended
            scored_items.sort(key=lambda x: x.recommendation_score, reverse=True)

        return RecommendationResponse(
            profile_id=profile.id,
            recommendations=scored_items[:limit],
            total_matches=len(scored_items)
        )

    @staticmethod
    def explain_recommendation(
        db: Session,
        profile: LearnerProfile,
        resource_id: int
    ) -> Optional[WhyThisResponse]:
        resource = db.query(LearningResource).filter(LearningResource.id == resource_id).first()
        if not resource:
            return None

        skill = resource.skill
        career_goal = profile.career_goal or db.query(CareerGoal).first()
        career_skills = db.query(CareerSkill).filter(CareerSkill.career_id == career_goal.id).all()
        career_skills_map = {cs.skill_id: cs for cs in career_skills}

        learner_skills = db.query(LearnerSkill).filter(LearnerSkill.profile_id == profile.id).all()
        learner_skills_map = {ls.skill_id: ls for ls in learner_skills}

        prerequisites = db.query(Prerequisite).all()
        dag_solver = PrerequisiteDAGSolver(career_skills, prerequisites)
        prereqs_met_map = dag_solver.check_prerequisites_met(learner_skills_map)

        feedbacks = db.query(Feedback).filter(Feedback.profile_id == profile.id).all()

        score_data = calculate_recommendation_score(
            resource=resource,
            profile=profile,
            career_skills_map=career_skills_map,
            learner_skills_map=learner_skills_map,
            prerequisites_met_map=prereqs_met_map,
            recent_feedbacks=feedbacks
        )

        career_skill = career_skills_map.get(skill.id)
        learner_skill = learner_skills_map.get(skill.id)

        req_prof = career_skill.required_proficiency if career_skill else 80.0
        cur_prof = learner_skill.current_proficiency if learner_skill else 0.0
        gap = max(0.0, req_prof - cur_prof)

        prereqs_status = "All prerequisites satisfied in your learning graph." if score_data["prerequisites_met"] else "Prerequisites pending completion."
        style_fit = f"Matches your preferred {profile.preferred_learning_style or 'Mixed'} learning style ({resource.learning_style_tag} format)."
        time_fit = f"Estimated duration ({resource.duration_hours}h) fits within your weekly budget of {profile.weekly_hours}h/week."
        outcome = f"Closes {round(gap)}% gap towards the {round(req_prof)}% required {skill.name} threshold for {career_goal.title}."

        narrative = (
            f"{skill.name} is one of your key target areas (current: {round(cur_prof)}% vs {round(req_prof)}% required) for {career_goal.title}. "
            f"This {resource.difficulty.lower()}-tier {resource.type.lower()} by {resource.provider} is rated {resource.rating}/5.0 and designed for {resource.learning_style_tag.lower()} learners. "
            f"Completing this module advances your career readiness while maintaining your weekly schedule."
        )

        return WhyThisResponse(
            resource_id=resource.id,
            resource_title=resource.title,
            learner_goal=career_goal.title,
            target_skill=skill.name,
            current_proficiency=round(cur_prof, 1),
            required_proficiency=round(req_prof, 1),
            gap=round(gap, 1),
            prerequisites_status=prereqs_status,
            learning_style_fit=style_fit,
            estimated_time=time_fit,
            expected_outcome=outcome,
            score_breakdown=score_data["score_breakdown"],
            ai_narrative_explanation=narrative
        )
