from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.models import CareerGoal, Skill, CareerSkill
from app.schemas.schemas import CareerGoalRead, SkillRead

class CareerService:
    @staticmethod
    def get_all_careers(db: Session) -> List[CareerGoalRead]:
        careers = db.query(CareerGoal).all()
        results = []
        for c in careers:
            skills_info = []
            for cs in c.career_skills:
                skills_info.append({
                    "skill_id": cs.skill_id,
                    "skill_name": cs.skill.name,
                    "required_proficiency": cs.required_proficiency,
                    "priority_tier": cs.priority_tier
                })
            results.append(CareerGoalRead(
                id=c.id,
                title=c.title,
                slug=c.slug,
                description=c.description,
                category=c.category,
                required_experience_level=c.required_experience_level,
                avg_salary=c.avg_salary,
                market_demand=c.market_demand,
                skills=skills_info
            ))
        return results

    @staticmethod
    def get_all_skills(db: Session, category: Optional[str] = None) -> List[SkillRead]:
        query = db.query(Skill)
        if category:
            query = query.filter(Skill.category == category)
        return [SkillRead.from_orm(s) for s in query.all()]

    @staticmethod
    def compare_career_goals(db: Session, profile_id: int, target_goal_id: int, current_goal_id: Optional[int] = None) -> dict:
        from app.models.models import LearnerProfile, LearnerSkill
        profile = db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
        if not profile:
            profile = db.query(LearnerProfile).first()

        current_goal = profile.career_goal if not current_goal_id else db.query(CareerGoal).filter(CareerGoal.id == current_goal_id).first()
        if not current_goal:
            current_goal = db.query(CareerGoal).first()

        target_goal = db.query(CareerGoal).filter(CareerGoal.id == target_goal_id).first()
        if not target_goal:
            target_goal = db.query(CareerGoal).filter(CareerGoal.id != current_goal.id).first() or current_goal

        current_cs = db.query(CareerSkill).filter(CareerSkill.career_id == current_goal.id).all()
        target_cs = db.query(CareerSkill).filter(CareerSkill.career_id == target_goal.id).all()
        learner_skills = db.query(LearnerSkill).filter(LearnerSkill.profile_id == profile.id).all()
        ls_map = {ls.skill_id: ls.current_proficiency for ls in learner_skills}

        current_skills_map = {cs.skill_id: cs for cs in current_cs}
        target_skills_map = {cs.skill_id: cs for cs in target_cs}

        shared_items = []
        additional_items = []

        shared_skill_ids = set(current_skills_map.keys()) & set(target_skills_map.keys())
        target_only_ids = set(target_skills_map.keys()) - set(current_skills_map.keys())

        # Overlap percentage
        overlap_pct = round((len(shared_skill_ids) / max(1, len(target_skills_map))) * 100, 1)

        for sid in shared_skill_ids:
            cur_cs = current_skills_map[sid]
            tar_cs = target_skills_map[sid]
            cur_p = ls_map.get(sid, 0.0)
            status = "Shared & Satisfied" if cur_p >= tar_cs.required_proficiency else "Shared Gap"
            shared_items.append({
                "skill_name": tar_cs.skill.name,
                "current_proficiency": cur_p,
                "current_goal_required": cur_cs.required_proficiency,
                "target_goal_required": tar_cs.required_proficiency,
                "status": status
            })

        for sid in target_only_ids:
            tar_cs = target_skills_map[sid]
            cur_p = ls_map.get(sid, 0.0)
            additional_items.append({
                "skill_name": tar_cs.skill.name,
                "current_proficiency": cur_p,
                "current_goal_required": None,
                "target_goal_required": tar_cs.required_proficiency,
                "status": "Additional Required"
            })

        additional_gaps = sum(1 for item in additional_items if item["current_proficiency"] < item["target_goal_required"])
        estimated_weeks = max(4, additional_gaps * 3)

        if overlap_pct >= 70:
            feasibility = "High Transferability"
            advice = f"Strong {overlap_pct}% competency overlap. Your mastery in {current_goal.title} transitions smoothly into {target_goal.title} with only ~{estimated_weeks} weeks of focused specialization."
        elif overlap_pct >= 45:
            feasibility = "Moderate Transition"
            advice = f"Solid foundational base ({overlap_pct}% overlap). You share core programming and analytical skills, requiring new modules in {target_goal.title} core domains."
        else:
            feasibility = "Significant Pivot"
            advice = f"{overlap_pct}% overlap. Transitioning requires building substantial new technical foundations."

        return {
            "profile_id": profile.id,
            "current_goal_title": current_goal.title,
            "target_goal_title": target_goal.title,
            "skill_overlap_percentage": overlap_pct,
            "shared_competencies_count": len(shared_skill_ids),
            "additional_gaps_count": len(additional_items),
            "estimated_additional_weeks": estimated_weeks,
            "shared_skills": shared_items,
            "additional_skills": additional_items,
            "transition_feasibility": feasibility,
            "ai_transition_advice": advice
        }

