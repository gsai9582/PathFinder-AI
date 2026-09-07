import json
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.models import (
    Project, LearnerProfile, LearnerSkill, Skill, CareerSkill, Prerequisite
)
from app.schemas.schemas import (
    ProjectRead, ProjectMilestone, ProjectPrerequisiteStatus,
    ProjectRecommendationItem, ProjectRecommendationResponse, ProjectDetailResponse
)
from app.ai.factory import get_ai_provider

class ProjectService:
    @staticmethod
    def _to_project_read(p: Project) -> ProjectRead:
        try:
            objectives = json.loads(p.learning_objectives_json) if p.learning_objectives_json else []
        except Exception:
            objectives = ["Complete core deliverables"]

        try:
            tech_stack = json.loads(p.tech_stack_json) if p.tech_stack_json else []
        except Exception:
            tech_stack = ["Python"]

        try:
            milestones_raw = json.loads(p.milestones_json) if p.milestones_json else []
            milestones = [
                ProjectMilestone(
                    id=idx + 1,
                    title=m.get("title", f"Milestone {idx+1}") if isinstance(m, dict) else str(m),
                    description=m.get("description", "Execute project milestone task") if isinstance(m, dict) else "Execute task",
                    is_completed=m.get("is_completed", False) if isinstance(m, dict) else False
                )
                for idx, m in enumerate(milestones_raw)
            ]
        except Exception:
            milestones = [
                ProjectMilestone(id=1, title="Setup Environment & Ingest Data", description="Configure environment and baseline repo.", is_completed=False),
                ProjectMilestone(id=2, title="Core Architecture & Implementation", description="Implement algorithms, model training or UI logic.", is_completed=False),
                ProjectMilestone(id=3, title="Evaluation & Documentation", description="Validate performance metrics and document portfolio artifact.", is_completed=False)
            ]

        try:
            prereqs = json.loads(p.prerequisites_json) if p.prerequisites_json else []
        except Exception:
            prereqs = []

        try:
            skills_dev = json.loads(p.skills_developed_json) if p.skills_developed_json else []
        except Exception:
            skills_dev = [p.skill.name] if p.skill else ["Technical Problem Solving"]

        return ProjectRead(
            id=p.id,
            title=p.title,
            slug=p.slug,
            difficulty=p.difficulty,
            primary_skill_id=p.primary_skill_id,
            skill_name=p.skill.name if p.skill else "Engineering",
            problem_statement=p.problem_statement,
            learning_objectives=objectives,
            tech_stack=tech_stack,
            estimated_hours=p.estimated_hours,
            expected_outcome=p.expected_outcome,
            portfolio_value=p.portfolio_value or "High Portfolio Impact",
            milestones=milestones,
            prerequisites=prereqs,
            skills_developed=skills_dev,
            template_repo_url=p.template_repo_url
        )

    @staticmethod
    def list_projects(
        db: Session,
        difficulty: Optional[str] = None,
        skill_id: Optional[int] = None
    ) -> List[ProjectRead]:
        query = db.query(Project)
        if difficulty and difficulty.lower() != "all":
            query = query.filter(Project.difficulty.ilike(f"%{difficulty}%"))
        if skill_id:
            query = query.filter(Project.primary_skill_id == skill_id)
        
        projects = query.all()
        return [ProjectService._to_project_read(p) for p in projects]

    @staticmethod
    def get_project(db: Session, project_id: int) -> Optional[ProjectRead]:
        p = db.query(Project).filter(Project.id == project_id).first()
        if not p:
            return None
        return ProjectService._to_project_read(p)

    @staticmethod
    def get_recommendations(
        db: Session,
        profile_id: Optional[int] = None
    ) -> ProjectRecommendationResponse:
        profile = None
        if profile_id:
            profile = db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
        if not profile:
            profile = db.query(LearnerProfile).first()

        career_goal_title = profile.career_goal.title if profile and profile.career_goal else "AI/ML Engineer"
        career_id = profile.career_goal_id if profile else 1

        # Fetch learner skills
        learner_skills_map = {}
        if profile:
            for ls in profile.skills:
                learner_skills_map[ls.skill_id] = {
                    "proficiency": ls.current_proficiency,
                    "confidence": ls.confidence_score
                }

        # Fetch career required skills
        career_skills = db.query(CareerSkill).filter(CareerSkill.career_id == career_id).all()
        career_skill_reqs = {cs.skill_id: cs.required_proficiency for cs in career_skills}

        all_projects = db.query(Project).all()
        ai = get_ai_provider()
        recommended_items = []

        difficulty_pref_map = {
            "Beginner": {"Beginner": 1.0, "Intermediate": 0.6, "Advanced": 0.3},
            "Intermediate": {"Intermediate": 1.0, "Beginner": 0.8, "Advanced": 0.7},
            "Advanced": {"Advanced": 1.0, "Intermediate": 0.8, "Beginner": 0.5}
        }
        learner_level = profile.experience_level if profile else "Intermediate"
        diff_weights = difficulty_pref_map.get(learner_level, {"Intermediate": 1.0, "Beginner": 0.8, "Advanced": 0.8})

        for p in all_projects:
            proj_read = ProjectService._to_project_read(p)
            primary_skill = p.skill.name if p.skill else "General"
            
            # Skill gap calculation
            cur_prof = learner_skills_map.get(p.primary_skill_id, {}).get("proficiency", 20.0)
            req_prof = career_skill_reqs.get(p.primary_skill_id, 75.0)
            gap = max(0.0, req_prof - cur_prof)

            # Check prerequisite satisfaction
            prereqs_status = []
            all_prereqs_satisfied = True
            
            # Find DB prerequisites for primary skill
            prereq_entities = db.query(Prerequisite).filter(Prerequisite.skill_id == p.primary_skill_id).all()
            if prereq_entities:
                for pre in prereq_entities:
                    p_skill = pre.prerequisite_skill or db.query(Skill).filter(Skill.id == pre.prerequisite_skill_id).first()
                    p_prof = learner_skills_map.get(pre.prerequisite_skill_id, {}).get("proficiency", 0.0)
                    is_sat = p_prof >= pre.min_proficiency_required
                    if not is_sat:
                        all_prereqs_satisfied = False
                    prereqs_status.append(ProjectPrerequisiteStatus(
                        skill_name=p_skill.name if p_skill else "Prerequisite",
                        current_proficiency=p_prof,
                        required_proficiency=pre.min_proficiency_required,
                        is_satisfied=is_sat
                    ))
            else:
                # Use project's listed string prerequisites
                for pre_name in proj_read.prerequisites:
                    matching_skill = db.query(Skill).filter(Skill.name.ilike(f"%{pre_name}%")).first()
                    p_prof = learner_skills_map.get(matching_skill.id, {}).get("proficiency", 60.0) if matching_skill else 65.0
                    is_sat = p_prof >= 55.0
                    if not is_sat:
                        all_prereqs_satisfied = False
                    prereqs_status.append(ProjectPrerequisiteStatus(
                        skill_name=pre_name,
                        current_proficiency=p_prof,
                        required_proficiency=60.0,
                        is_satisfied=is_sat
                    ))

            # Score Formula:
            # - Gap urgency: up to 35 pts
            gap_factor = min(1.0, gap / 60.0) * 35.0
            # - Difficulty match: up to 25 pts
            diff_factor = diff_weights.get(p.difficulty, 0.7) * 25.0
            # - Prerequisite satisfaction: 20 pts
            prereq_factor = 20.0 if all_prereqs_satisfied else 8.0
            # - Career relevance: 20 pts
            career_factor = 20.0 if p.primary_skill_id in career_skill_reqs else 10.0

            total_score = round(gap_factor + diff_factor + prereq_factor + career_factor, 1)

            # Priority tier
            if total_score >= 80:
                priority_tier = "Top Recommended"
            elif total_score >= 65:
                priority_tier = "Core Milestone"
            else:
                priority_tier = "Advanced Capstone"

            # Readiness status
            if all_prereqs_satisfied:
                readiness_status = "Ready to Build"
            else:
                unmet_count = sum(1 for pr in prereqs_status if not pr.is_satisfied)
                readiness_status = f"{unmet_count} Prerequisite{'s' if unmet_count > 1 else ''} Pending"

            why_text = ai.generate_project_explanation(
                project_title=p.title,
                primary_skill=primary_skill,
                career_goal=career_goal_title,
                gap=gap,
                prereqs_met=all_prereqs_satisfied,
                difficulty=p.difficulty
            )

            recommended_items.append(ProjectRecommendationItem(
                project=proj_read,
                match_score=total_score,
                priority_tier=priority_tier,
                why_this_project=why_text,
                readiness_status=readiness_status,
                prerequisites_met=all_prereqs_satisfied,
                prerequisites_status=prereqs_status,
                skills_developed=proj_read.skills_developed
            ))

        # Sort by match score descending
        recommended_items.sort(key=lambda x: x.match_score, reverse=True)

        return ProjectRecommendationResponse(
            profile_id=profile.id if profile else 1,
            career_goal=career_goal_title,
            recommendations=recommended_items,
            total_projects=len(recommended_items)
        )

    @staticmethod
    def get_project_details(
        db: Session,
        project_id: int,
        profile_id: Optional[int] = None
    ) -> Optional[ProjectDetailResponse]:
        proj = db.query(Project).filter(Project.id == project_id).first()
        if not proj:
            return None

        profile = None
        if profile_id:
            profile = db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
        if not profile:
            profile = db.query(LearnerProfile).first()

        proj_read = ProjectService._to_project_read(proj)
        career_goal_title = profile.career_goal.title if profile and profile.career_goal else "AI/ML Engineer"

        learner_skills_map = {}
        if profile:
            for ls in profile.skills:
                learner_skills_map[ls.skill_id] = ls.current_proficiency

        cur_prof = learner_skills_map.get(proj.primary_skill_id, 25.0)
        gap = max(0.0, 75.0 - cur_prof)

        prereqs_status = []
        all_sat = True
        prereq_entities = db.query(Prerequisite).filter(Prerequisite.skill_id == proj.primary_skill_id).all()
        if prereq_entities:
            for pre in prereq_entities:
                p_skill = pre.prerequisite_skill or db.query(Skill).filter(Skill.id == pre.prerequisite_skill_id).first()
                p_prof = learner_skills_map.get(pre.prerequisite_skill_id, 0.0)
                is_sat = p_prof >= pre.min_proficiency_required
                if not is_sat:
                    all_sat = False
                prereqs_status.append(ProjectPrerequisiteStatus(
                    skill_name=p_skill.name if p_skill else "Prerequisite",
                    current_proficiency=p_prof,
                    required_proficiency=pre.min_proficiency_required,
                    is_satisfied=is_sat
                ))
        else:
            for pre_name in proj_read.prerequisites:
                matching_skill = db.query(Skill).filter(Skill.name.ilike(f"%{pre_name}%")).first()
                p_prof = learner_skills_map.get(matching_skill.id, 60.0) if matching_skill else 60.0
                is_sat = p_prof >= 55.0
                if not is_sat:
                    all_sat = False
                prereqs_status.append(ProjectPrerequisiteStatus(
                    skill_name=pre_name,
                    current_proficiency=p_prof,
                    required_proficiency=60.0,
                    is_satisfied=is_sat
                ))

        ai = get_ai_provider()
        why_text = ai.generate_project_explanation(
            project_title=proj.title,
            primary_skill=proj.skill.name if proj.skill else "Machine Learning",
            career_goal=career_goal_title,
            gap=gap,
            prereqs_met=all_sat,
            difficulty=proj.difficulty
        )

        return ProjectDetailResponse(
            project=proj_read,
            why_this_project=why_text,
            skills_developed=proj_read.skills_developed,
            estimated_time=f"{proj.estimated_hours} hours",
            portfolio_value=proj_read.portfolio_value,
            prerequisites=prereqs_status,
            milestones=proj_read.milestones,
            readiness_status="Ready to Build" if all_sat else f"{len([p for p in prereqs_status if not p.is_satisfied])} Prereqs Pending"
        )
