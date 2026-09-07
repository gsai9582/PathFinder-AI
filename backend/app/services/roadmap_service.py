from typing import Dict, Any, List, Optional
import datetime
from sqlalchemy.orm import Session
from app.models.models import (
    LearnerProfile, CareerGoal, CareerSkill, LearnerSkill, Skill, Prerequisite,
    Roadmap, RoadmapPhase, RoadmapItem, LearningResource, Assessment, Project
)
from app.schemas.schemas import RoadmapRead, RoadmapPhaseRead, RoadmapItemRead
from app.roadmap.dag_solver import PrerequisiteDAGSolver
from app.recommendation.scoring import calculate_recommendation_score

class RoadmapService:
    @staticmethod
    def get_or_generate_roadmap(db: Session, profile: LearnerProfile, force_regenerate: bool = False) -> Roadmap:
        # Check if active roadmap exists
        existing_roadmap = db.query(Roadmap).filter(
            Roadmap.profile_id == profile.id,
            Roadmap.is_active == True
        ).first()

        if existing_roadmap and not force_regenerate:
            return existing_roadmap

        if existing_roadmap and force_regenerate:
            existing_roadmap.is_active = False
            db.commit()

        # Generate new roadmap
        career_goal = profile.career_goal or db.query(CareerGoal).first()
        career_skills = db.query(CareerSkill).filter(CareerSkill.career_id == career_goal.id).all()
        prerequisites = db.query(Prerequisite).all()
        learner_skills = db.query(LearnerSkill).filter(LearnerSkill.profile_id == profile.id).all()
        learner_skills_map = {ls.skill_id: ls for ls in learner_skills}

        dag_solver = PrerequisiteDAGSolver(career_skills, prerequisites)
        topological_phases = dag_solver.generate_topological_phases(learner_skills_map)
        prereqs_met_map = dag_solver.check_prerequisites_met(learner_skills_map)
        career_skills_map = {cs.skill_id: cs for cs in career_skills}

        new_roadmap = Roadmap(
            profile_id=profile.id,
            career_goal_id=career_goal.id,
            title=f"Personalized Pathway: {career_goal.title}",
            description=f"AI-optimized roadmap tailored to your {profile.experience_level.lower()} background and {profile.weekly_hours}h weekly schedule.",
            total_estimated_hours=0.0,
            status="In Progress",
            is_active=True
        )
        db.add(new_roadmap)
        db.flush()

        total_hours = 0.0

        for phase_info in topological_phases:
            phase = RoadmapPhase(
                roadmap_id=new_roadmap.id,
                phase_number=phase_info["phase_number"],
                title=phase_info["title"],
                description=f"Master key dependencies and competencies for {phase_info['title']}.",
                estimated_hours=phase_info["estimated_hours"],
                status=phase_info["status"],
                milestone_name=f"Milestone {phase_info['phase_number']}: Core Competency Verified"
            )
            db.add(phase)
            db.flush()
            total_hours += phase_info["estimated_hours"]

            # Add learning resources for each skill in this phase
            item_order = 0
            for skill_id in phase_info["skill_ids"]:
                skill = db.query(Skill).filter(Skill.id == skill_id).first()
                resources = db.query(LearningResource).filter(
                    LearningResource.primary_skill_id == skill_id
                ).all()

                # Score resources to pick best match
                scored_resources = []
                for res in resources:
                    score_data = calculate_recommendation_score(
                        res, profile, career_skills_map, learner_skills_map, prereqs_met_map
                    )
                    scored_resources.append((score_data["score"], res))
                scored_resources.sort(key=lambda x: x[0], reverse=True)

                chosen_resource = scored_resources[0][1] if scored_resources else None

                # Determine item status
                ls = learner_skills_map.get(skill_id)
                cs = career_skills_map.get(skill_id)
                req_prof = cs.required_proficiency if cs else 80.0
                cur_prof = ls.current_proficiency if ls else 0.0

                if cur_prof >= req_prof:
                    item_status = "Completed"
                elif phase.status == "In Progress":
                    item_status = "In Progress" if item_order == 0 else "Available"
                elif phase.status == "Available":
                    item_status = "Available"
                else:
                    item_status = "Locked"

                item_title = chosen_resource.title if chosen_resource else f"Core Foundations: {skill.name if skill else 'Module'}"
                res_mins = int(chosen_resource.duration_hours * 60) if chosen_resource else 60
                res_diff = chosen_resource.difficulty if chosen_resource else "Intermediate"
                res_obj = chosen_resource.description if chosen_resource else f"Master fundamental principles, syntax, and applied patterns for {skill.name if skill else 'this competency'}."

                # Get prerequisite summary
                prereq_details = dag_solver.get_skill_prerequisites_details(skill_id, learner_skills_map)
                if prereq_details:
                    prereq_summary_str = ", ".join([f"{p['skill_name']} ({int(p['required_proficiency'])}%+)" for p in prereq_details])
                else:
                    prereq_summary_str = "None (Foundational Module)"

                item_comp_pct = 100.0 if item_status == "Completed" else (50.0 if item_status == "In Progress" else 0.0)

                item = RoadmapItem(
                    phase_id=phase.id,
                    resource_id=chosen_resource.id if chosen_resource else None,
                    skill_id=skill_id,
                    order_index=item_order,
                    title=item_title,
                    objective=res_obj,
                    item_type="Learning",
                    difficulty=res_diff,
                    estimated_minutes=res_mins,
                    status=item_status,
                    completion_percentage=item_comp_pct,
                    prerequisites_summary=prereq_summary_str,
                    unlocked_at=datetime.datetime.utcnow() if item_status in ["In Progress", "Available"] else None,
                    completed_at=datetime.datetime.utcnow() if item_status == "Completed" else None
                )
                db.add(item)
                item_order += 1

                # Add assessment checkpoint for each skill in phase
                assessment = db.query(Assessment).filter(Assessment.skill_id == skill_id).first()
                if assessment:
                    assess_status = "Available" if item_status in ["Completed", "In Progress"] else "Locked"
                    assess_item = RoadmapItem(
                        phase_id=phase.id,
                        skill_id=skill_id,
                        assessment_id=assessment.id,
                        order_index=item_order,
                        title=f"Knowledge Check: {skill.name if skill else 'Assessment'}",
                        objective=f"Adaptive standardized evaluation to benchmark proficiency and identify micro-skill gaps in {skill.name if skill else 'this topic'}.",
                        item_type="Assessment",
                        difficulty=assessment.difficulty or "Intermediate",
                        estimated_minutes=25,
                        status=assess_status,
                        completion_percentage=100.0 if cur_prof >= req_prof else 0.0,
                        prerequisites_summary=f"Requires completion of {item_title}"
                    )
                    db.add(assess_item)
                    item_order += 1

            # Add phase project milestone
            primary_skill_id = phase_info["skill_ids"][0] if phase_info["skill_ids"] else None
            project = db.query(Project).filter(Project.primary_skill_id == primary_skill_id).first() if primary_skill_id else None
            if project:
                proj_status = "Available" if phase.status in ["In Progress", "Available"] else "Locked"
                proj_item = RoadmapItem(
                    phase_id=phase.id,
                    skill_id=primary_skill_id,
                    project_id=project.id,
                    order_index=item_order,
                    title=f"Hands-on Project: {project.title}",
                    objective=project.problem_statement,
                    item_type="Project",
                    difficulty=project.difficulty or "Intermediate",
                    estimated_minutes=int(project.estimated_hours * 60),
                    status=proj_status,
                    completion_percentage=0.0,
                    prerequisites_summary=f"Requires completion of Phase {phase_info['phase_number']} learning modules"
                )
                db.add(proj_item)

        new_roadmap.total_estimated_hours = round(total_hours, 1)
        db.commit()
        db.refresh(new_roadmap)
        return new_roadmap

    @staticmethod
    def format_roadmap_response(roadmap: Roadmap) -> RoadmapRead:
        total_items = 0
        completed_items = 0
        phases_read = []

        for p in roadmap.phases:
            p_items_read = []
            phase_total = len(p.items)
            phase_completed = sum(1 for item in p.items if item.status == "Completed")
            total_items += phase_total
            completed_items += phase_completed

            phase_skills = set()
            for item in p.items:
                if item.skill:
                    phase_skills.add(item.skill.name)

                p_items_read.append(RoadmapItemRead(
                    id=item.id,
                    phase_id=item.phase_id,
                    resource_id=item.resource_id,
                    skill_id=item.skill_id,
                    skill_name=item.skill.name if item.skill else None,
                    resource_title=item.resource.title if item.resource else None,
                    resource_url=item.resource.url if item.resource else None,
                    resource_provider=item.resource.provider if item.resource else None,
                    resource_rating=item.resource.rating if item.resource else None,
                    order_index=item.order_index,
                    title=item.title,
                    objective=item.objective,
                    item_type=item.item_type,
                    difficulty=item.difficulty or "Intermediate",
                    estimated_minutes=item.estimated_minutes,
                    status=item.status,
                    completion_percentage=item.completion_percentage or (100.0 if item.status == "Completed" else 0.0),
                    prerequisites_summary=item.prerequisites_summary,
                    prerequisites_met=not item.is_delayed,
                    assessment_id=item.assessment_id,
                    assessment_title=item.assessment.title if item.assessment else None,
                    project_id=item.project_id,
                    project_title=item.project.title if item.project else None,
                    is_remedial=item.is_remedial,
                    is_delayed=item.is_delayed,
                    is_accelerated=item.is_accelerated,
                    unlocked_at=item.unlocked_at,
                    completed_at=item.completed_at
                ))

            p_comp_pct = round((phase_completed / max(1, phase_total)) * 100, 1) if phase_total > 0 else 0.0

            phases_read.append(RoadmapPhaseRead(
                id=p.id,
                roadmap_id=p.roadmap_id,
                phase_number=p.phase_number,
                title=p.title,
                description=p.description,
                estimated_hours=p.estimated_hours,
                status=p.status,
                milestone_name=p.milestone_name,
                is_remedial=p.is_remedial,
                completion_percentage=p_comp_pct,
                skills=list(phase_skills),
                items=p_items_read
            ))

        overall_pct = round((completed_items / max(1, total_items)) * 100, 1) if total_items > 0 else 0.0

        return RoadmapRead(
            id=roadmap.id,
            profile_id=roadmap.profile_id,
            career_goal_id=roadmap.career_goal_id,
            career_goal_title=roadmap.career_goal.title if roadmap.career_goal else "Career Path",
            title=roadmap.title,
            description=roadmap.description,
            total_estimated_hours=roadmap.total_estimated_hours,
            status=roadmap.status,
            is_active=roadmap.is_active,
            completion_percentage=overall_pct,
            phases=phases_read,
            created_at=roadmap.created_at,
            updated_at=roadmap.updated_at
        )
