from typing import Dict, Any, List, Optional
import datetime
from sqlalchemy.orm import Session
from app.models.models import (
    LearnerProfile, CareerGoal, CareerSkill, LearnerSkill, Skill, Prerequisite,
    LearningResource, Project, AssessmentAttempt, Assessment
)
from app.schemas.schemas import (
    SkillGapResponse, SkillGapItem, RadarDataPoint, DependencyGraphData,
    SkillDetailResponse, SkillPrerequisiteInfo, SkillUnlockInfo, ResourceRead, ProjectRead
)
from app.roadmap.dag_solver import PrerequisiteDAGSolver
from app.ai.factory import get_ai_provider

class SkillGapService:
    @staticmethod
    def analyze_skill_gaps(db: Session, profile: LearnerProfile) -> SkillGapResponse:
        career_goal = profile.career_goal
        if not career_goal:
            career_goal = db.query(CareerGoal).first()

        career_skills = db.query(CareerSkill).filter(CareerSkill.career_id == career_goal.id).all()
        prerequisites = db.query(Prerequisite).all()
        learner_skills = db.query(LearnerSkill).filter(LearnerSkill.profile_id == profile.id).all()
        
        learner_skills_map = {ls.skill_id: ls for ls in learner_skills}
        
        # Check prerequisites
        dag_solver = PrerequisiteDAGSolver(career_skills, prerequisites)
        prereqs_met_map = dag_solver.check_prerequisites_met(learner_skills_map)

        skill_gap_items: List[SkillGapItem] = []
        radar_data: List[RadarDataPoint] = []
        
        critical_count = 0
        needs_attention_count = 0
        developing_count = 0
        strong_count = 0
        
        total_weighted_gap = 0.0
        total_weighted_req = 0.0
        total_weighted_cur = 0.0
        total_weight = 0.0

        for cs in career_skills:
            skill = cs.skill
            ls = learner_skills_map.get(cs.skill_id)
            cur_prof = ls.current_proficiency if ls else 0.0
            req_prof = cs.required_proficiency
            gap = max(0.0, req_prof - cur_prof)
            gap_pct = round((gap / req_prof) * 100, 1) if req_prof > 0 else 0.0

            # Determine Status: Strong, Developing, Needs Attention, Critical Gap
            if cur_prof >= req_prof * 0.9 or gap <= 5.0:
                status = "Strong"
                strong_count += 1
            elif gap >= 45.0 or (cs.importance_weight >= 1.6 and gap >= 30.0):
                status = "Critical Gap"
                critical_count += 1
            elif gap >= 25.0:
                status = "Needs Attention"
                needs_attention_count += 1
            else:
                status = "Developing"
                developing_count += 1

            # Determine Priority: Critical, High, Medium, Low
            if status == "Critical Gap" or (gap >= 35.0 and cs.importance_weight >= 1.5):
                priority = "Critical"
            elif gap >= 25.0 or (cs.importance_weight >= 1.4 and gap >= 15.0):
                priority = "High"
            elif gap >= 10.0:
                priority = "Medium"
            else:
                priority = "Low"

            confidence = ls.confidence_score if ls else 0.5
            source = ls.source if ls else "self_reported"
            evidence = ls.evidence if ls else None
            last_assessed = ls.last_assessed_at if ls else None
            prereqs_met = prereqs_met_map.get(cs.skill_id, True)

            item = SkillGapItem(
                skill_id=skill.id,
                skill_name=skill.name,
                category=skill.category,
                current_proficiency=round(cur_prof, 1),
                required_proficiency=round(req_prof, 1),
                gap=round(gap, 1),
                gap_percentage=gap_pct,
                priority=priority,
                status=status,
                confidence=round(confidence, 2),
                prerequisites_met=prereqs_met,
                importance_weight=cs.importance_weight,
                source=source,
                last_assessed_at=last_assessed,
                evidence=evidence
            )
            skill_gap_items.append(item)

            radar_data.append(RadarDataPoint(
                skill=skill.name,
                current=round(cur_prof, 1),
                required=round(req_prof, 1)
            ))

            total_weighted_gap += gap * cs.importance_weight
            total_weighted_req += req_prof * cs.importance_weight
            total_weighted_cur += cur_prof * cs.importance_weight
            total_weight += cs.importance_weight

        # Overall gap score normalized
        overall_gap_score = round(total_weighted_gap / max(1.0, total_weight), 1)
        gap_reduction_progress = round((total_weighted_cur / max(1.0, total_weighted_req)) * 100, 1)

        # Build Dependency Graph Data
        skill_items_map = {item.skill_id: item for item in skill_gap_items}
        dep_graph_dict = dag_solver.get_dependency_graph_data(learner_skills_map, skill_items_map)
        dep_graph = DependencyGraphData(**dep_graph_dict)

        # Critical gaps and strong skills lists
        critical_gaps = [item for item in skill_gap_items if item.status == "Critical Gap"]
        strong_skills = [item for item in skill_gap_items if item.status == "Strong"]

        # AI Summary
        critical_names = [item.skill_name for item in critical_gaps]
        strong_names = [item.skill_name for item in strong_skills]
        
        # Check prerequisite bottlenecks
        bottleneck_skills = []
        for cg in critical_gaps:
            for edge in dep_graph.edges:
                if edge.source_id == cg.skill_id and not edge.is_satisfied:
                    bottleneck_skills.append(f"{cg.skill_name} (blocks {edge.target_name})")

        summary = (
            f"Competency Analysis for {career_goal.title}: Your foundations in {', '.join(strong_names) if strong_names else 'core computing'} are strong. "
            f"However, critical gaps in {', '.join(critical_names[:3]) if critical_names else 'advanced specializations'} represent a {round(overall_gap_score)}% weighted deficit. "
        )
        if bottleneck_skills:
            summary += f"Prerequisite bottleneck detected: {', '.join(bottleneck_skills[:2])}. You must strengthen these prerequisite competencies before advancing to high-level specialized modules."
        else:
            summary += "Your prerequisite chains are mostly cleared, allowing direct focus on closing domain-specific machine learning gaps."

        return SkillGapResponse(
            profile_id=profile.id,
            career_goal_title=career_goal.title,
            overall_gap_score=overall_gap_score,
            gap_reduction_progress=gap_reduction_progress,
            skills_count=len(skill_gap_items),
            critical_gaps_count=critical_count,
            needs_attention_count=needs_attention_count,
            strong_skills_count=strong_count,
            developing_skills_count=developing_count,
            radar_data=radar_data,
            skill_gaps=skill_gap_items,
            critical_gaps=critical_gaps,
            strong_skills=strong_skills,
            dependency_graph=dep_graph,
            ai_analysis_summary=summary
        )

    @staticmethod
    def get_skill_detail(db: Session, profile: LearnerProfile, skill_id: int) -> Optional[SkillDetailResponse]:
        skill = db.query(Skill).filter(Skill.id == skill_id).first()
        if not skill:
            return None

        career_goal = profile.career_goal or db.query(CareerGoal).first()
        career_skill = db.query(CareerSkill).filter(
            CareerSkill.career_id == career_goal.id,
            CareerSkill.skill_id == skill_id
        ).first()

        req_prof = career_skill.required_proficiency if career_skill else 75.0
        importance = career_skill.importance_weight if career_skill else 1.0

        learner_skill = db.query(LearnerSkill).filter(
            LearnerSkill.profile_id == profile.id,
            LearnerSkill.skill_id == skill_id
        ).first()

        cur_prof = learner_skill.current_proficiency if learner_skill else 0.0
        confidence = learner_skill.confidence_score if learner_skill else 0.5
        source = learner_skill.source if learner_skill else "self_reported"
        evidence = learner_skill.evidence if learner_skill and learner_skill.evidence else (
            "Self-reported baseline from onboarding profile. No verified proctored assessment submitted."
        )
        last_assessed = learner_skill.last_assessed_at if learner_skill else None

        gap = max(0.0, req_prof - cur_prof)
        gap_pct = round((gap / req_prof) * 100, 1) if req_prof > 0 else 0.0

        if cur_prof >= req_prof * 0.9 or gap <= 5.0:
            status = "Strong"
        elif gap >= 45.0 or (importance >= 1.6 and gap >= 30.0):
            status = "Critical Gap"
        elif gap >= 25.0:
            status = "Needs Attention"
        else:
            status = "Developing"

        if status == "Critical Gap" or (gap >= 35.0 and importance >= 1.5):
            priority = "Critical"
        elif gap >= 25.0 or (importance >= 1.4 and gap >= 15.0):
            priority = "High"
        elif gap >= 10.0:
            priority = "Medium"
        else:
            priority = "Low"

        # Prerequisites for this skill
        prereq_records = db.query(Prerequisite).filter(Prerequisite.skill_id == skill_id).all()
        prereqs_info: List[SkillPrerequisiteInfo] = []
        all_prereqs_met = True

        for p in prereq_records:
            prereq_skill = db.query(Skill).filter(Skill.id == p.prerequisite_skill_id).first()
            p_ls = db.query(LearnerSkill).filter(
                LearnerSkill.profile_id == profile.id,
                LearnerSkill.skill_id == p.prerequisite_skill_id
            ).first()
            p_cur = p_ls.current_proficiency if p_ls else 0.0
            is_sat = p_cur >= p.min_proficiency_required
            if not is_sat:
                all_prereqs_met = False

            if prereq_skill:
                prereqs_info.append(SkillPrerequisiteInfo(
                    prerequisite_skill_id=p.prerequisite_skill_id,
                    prerequisite_name=prereq_skill.name,
                    min_proficiency_required=p.min_proficiency_required,
                    current_proficiency=round(p_cur, 1),
                    is_satisfied=is_sat
                ))

        # Skills unlocked by this skill (downstream)
        downstream_records = db.query(Prerequisite).filter(Prerequisite.prerequisite_skill_id == skill_id).all()
        unlocks_info: List[SkillUnlockInfo] = []
        for d in downstream_records:
            target_sk = db.query(Skill).filter(Skill.id == d.skill_id).first()
            if target_sk:
                unlocks_info.append(SkillUnlockInfo(
                    skill_id=target_sk.id,
                    skill_name=target_sk.name,
                    min_proficiency_required=d.min_proficiency_required
                ))

        # Related Learning Resources
        resources = db.query(LearningResource).filter(
            LearningResource.primary_skill_id == skill_id
        ).order_by(LearningResource.rating.desc()).limit(4).all()

        res_reads = []
        for r in resources:
            rr = ResourceRead.from_orm(r)
            rr.skill_name = skill.name
            res_reads.append(rr)

        # Related Projects
        projects = db.query(Project).filter(
            Project.primary_skill_id == skill_id
        ).limit(3).all()

        from app.services.project_service import ProjectService
        proj_reads = [ProjectService._to_project_read(p) for p in projects]

        # Assessment performance
        assess_attempt = db.query(AssessmentAttempt).join(Assessment).filter(
            AssessmentAttempt.profile_id == profile.id,
            Assessment.skill_id == skill_id
        ).order_by(AssessmentAttempt.created_at.desc()).first()

        assessment_score = round(assess_attempt.score_percentage, 1) if assess_attempt else None

        # AI Recommendation
        if status == "Strong":
            ai_rec = (
                f"You have already attained benchmark readiness ({round(cur_prof)}% vs {round(req_prof)}% required) in {skill.name}. "
                f"Maintain your proficiency through applied portfolio projects or focus on downstream dependent skills like {', '.join([u.skill_name for u in unlocks_info]) if unlocks_info else 'specialized tracks'}."
            )
        elif not all_prereqs_met:
            unmet_names = [p.prerequisite_name for p in prereqs_info if not p.is_satisfied]
            ai_rec = (
                f"Before diving into {skill.name}, complete your prerequisite foundation in {', '.join(unmet_names)}. "
                f"Attempting {skill.name} prematurely creates cognitive overload and lower retention."
            )
        else:
            ai_rec = (
                f"Focus on practical drills in {skill.name} to close the {round(gap)}% proficiency gap. "
                f"We recommend dedicating ~{round(gap * 0.25, 1)} hours across the curated resources below to reach the {round(req_prof)}% {career_goal.title} threshold."
            )

        return SkillDetailResponse(
            skill_id=skill.id,
            skill_name=skill.name,
            category=skill.category,
            description=skill.description,
            difficulty_tier=skill.difficulty_tier,
            current_proficiency=round(cur_prof, 1),
            required_proficiency=round(req_prof, 1),
            gap=round(gap, 1),
            gap_percentage=gap_pct,
            priority=priority,
            status=status,
            confidence=round(confidence, 2),
            source=source,
            last_assessed_at=last_assessed,
            evidence=evidence,
            importance_weight=importance,
            prerequisites_met=all_prereqs_met,
            prerequisites=prereqs_info,
            unlocks_skills=unlocks_info,
            related_resources=res_reads,
            related_projects=proj_reads,
            assessment_score=assessment_score,
            ai_recommendation=ai_rec
        )
