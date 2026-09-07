from typing import Dict, Any, List, Optional
import datetime
from sqlalchemy.orm import Session
from app.models.models import (
    Roadmap, RoadmapPhase, RoadmapItem, AssessmentAttempt, LearnerSkill, 
    LearnerProfile, AIInsight, LearningResource, Skill, Assessment, Project
)
from app.schemas.schemas import (
    AdaptationRequest, AdaptationResponse, RoadmapDiffItem, RoadmapRead
)
from app.ai.factory import get_ai_provider

def execute_roadmap_adaptation(
    db: Session,
    req: AdaptationRequest
) -> AdaptationResponse:
    """
    Applies real-time adaptive mutations to the learner's active roadmap.
    Supports score branches (<50, 80-89, >=90), feedback ('Too Hard', 'Too Easy'), and inactivity triggers.
    Returns a rich Before -> After visual diff.
    """
    from app.services.roadmap_service import RoadmapService
    profile = db.query(LearnerProfile).filter(LearnerProfile.id == req.profile_id).first()
    if not profile:
        profile = db.query(LearnerProfile).first()

    if not profile:
        raise ValueError("Learner profile not found")

    # Get active roadmap (or generate if none)
    active_roadmap = RoadmapService.get_or_generate_roadmap(db, profile)

    # Determine target skill
    skill = None
    if req.skill_id:
        skill = db.query(Skill).filter(Skill.id == req.skill_id).first()
    elif req.skill_name:
        skill = db.query(Skill).filter(Skill.name.ilike(f"%{req.skill_name}%")).first()

    if not skill:
        # Default to Machine Learning or first skill
        skill = db.query(Skill).filter(Skill.name.ilike("%Machine Learning%")).first() or db.query(Skill).first()

    skill_name = skill.name if skill else "Target Competency"
    score = req.score if req.score is not None else 45.0

    # 1. Update or fetch LearnerSkill
    learner_skill = db.query(LearnerSkill).filter(
        LearnerSkill.profile_id == profile.id,
        LearnerSkill.skill_id == skill.id
    ).first()

    old_prof = learner_skill.current_proficiency if learner_skill else 40.0
    old_conf = learner_skill.confidence_score if learner_skill else 0.5

    changes: List[RoadmapDiffItem] = []
    before_summary = ""
    after_summary = ""
    summary_text = ""

    # Find the active or relevant phase
    active_phase = next((p for p in active_roadmap.phases if p.status in ["In Progress", "Available"]), None)
    if not active_phase and active_roadmap.phases:
        active_phase = active_roadmap.phases[0]

    # Find subsequent downstream phases
    downstream_phases = [p for p in active_roadmap.phases if p.phase_number > (active_phase.phase_number if active_phase else 1)]

    # =========================================================================
    # BRANCH 1: Low Score (< 50%) or "Too Hard" Difficulty Feedback
    # =========================================================================
    if score < 50 or req.difficulty_feedback == "Too Hard":
        new_prof = round(max(10.0, 0.6 * old_prof + 0.4 * score), 1)
        new_conf = max(0.2, round(old_conf - 0.25, 2))
        conf_change_str = f"{old_conf:.2f} → {new_conf:.2f} (Low Confidence Signal)"

        if not learner_skill:
            learner_skill = LearnerSkill(
                profile_id=profile.id,
                skill_id=skill.id,
                current_proficiency=new_prof,
                confidence_score=new_conf,
                source="assessment",
                last_assessed_at=datetime.datetime.utcnow()
            )
            db.add(learner_skill)
        else:
            learner_skill.current_proficiency = new_prof
            learner_skill.confidence_score = new_conf
            learner_skill.last_assessed_at = datetime.datetime.utcnow()
            learner_skill.source = "adaptive_assessment"

        before_summary = f"Linear progression schedule assuming ready mastery of {skill_name} and immediate advancement to complex topics."

        # A. Inject Reinforcement Review Module
        remedial_title = f"⚡ Reinforcement Review: {skill_name} Foundations & Core Intuition"
        existing_rem = db.query(RoadmapItem).filter(
            RoadmapItem.phase_id == active_phase.id,
            RoadmapItem.title == remedial_title
        ).first()

        if not existing_rem:
            rem_item = RoadmapItem(
                phase_id=active_phase.id,
                skill_id=skill.id,
                order_index=0,
                title=remedial_title,
                objective=f"Step-by-step remediation focusing on fundamental formulas, visual analogies, and diagnostic misconceptions identified during evaluation ({score}% score).",
                item_type="Revision",
                difficulty="Beginner",
                estimated_minutes=45,
                status="In Progress",
                completion_percentage=0.0,
                prerequisites_summary="Auto-injected remediation module",
                is_remedial=True,
                unlocked_at=datetime.datetime.utcnow()
            )
            db.add(rem_item)

        changes.append(RoadmapDiffItem(
            action="added",
            title=f"Reinforcement Review ({skill_name})",
            phase_title=active_phase.title,
            reason=f"Assessment score of {int(score)}% indicated conceptual gaps in foundational prerequisites.",
            badge_color="rose"
        ))

        # B. Inject Targeted Practice Questions
        practice_title = f"🎯 Targeted Problem Set: {skill_name} Common Pitfalls"
        existing_prac = db.query(RoadmapItem).filter(
            RoadmapItem.phase_id == active_phase.id,
            RoadmapItem.title == practice_title
        ).first()

        if not existing_prac:
            prac_item = RoadmapItem(
                phase_id=active_phase.id,
                skill_id=skill.id,
                order_index=1,
                title=practice_title,
                objective=f"5 interactive diagnostic practice scenarios to solidify prerequisite understanding before retaking milestone assessment.",
                item_type="Practice",
                difficulty="Beginner",
                estimated_minutes=30,
                status="Available",
                completion_percentage=0.0,
                prerequisites_summary="Auto-injected targeted practice set",
                is_remedial=True,
                unlocked_at=datetime.datetime.utcnow()
            )
            db.add(prac_item)

        changes.append(RoadmapDiffItem(
            action="added",
            title=f"Practice Problem Set ({skill_name})",
            phase_title=active_phase.title,
            reason="Reinforce calculation and intuition with guided feedback prior to advanced coursework.",
            badge_color="amber"
        ))

        # C. Delay Downstream Advanced Modules
        for dp in downstream_phases:
            for d_item in dp.items:
                if d_item.difficulty == "Advanced" or d_item.item_type in ["Learning", "Assessment"]:
                    d_item.is_delayed = True
                    d_item.status = "Locked"

        delayed_phase_title = downstream_phases[0].title if downstream_phases else "Upcoming Advanced Modules"
        changes.append(RoadmapDiffItem(
            action="delayed",
            title=f"Advanced Modules ({delayed_phase_title})",
            phase_title=delayed_phase_title,
            reason="Temporarily postponed to prevent cognitive overload until foundational benchmarks are verified.",
            badge_color="blue"
        ))

        after_summary = f"Roadmap dynamically adapted: 2 reinforcement modules added, downstream advanced topics paused until {skill_name} baseline reaches 70%."
        summary_text = f"PathFinder detected a learning opportunity in {skill_name} (Score: {int(score)}%). Injected targeted reinforcement modules and buffered advanced downstream topics to guarantee mastery."

    # =========================================================================
    # BRANCH 2: High Mastery Score (>= 90%) or "Too Easy" Feedback
    # =========================================================================
    elif score >= 90 or req.difficulty_feedback == "Too Easy":
        new_prof = round(min(100.0, 0.4 * old_prof + 0.6 * score), 1)
        new_conf = min(0.98, round(old_conf + 0.3, 2))
        conf_change_str = f"{old_conf:.2f} → {new_conf:.2f} (High Mastery Confidence)"

        if not learner_skill:
            learner_skill = LearnerSkill(
                profile_id=profile.id,
                skill_id=skill.id,
                current_proficiency=new_prof,
                confidence_score=new_conf,
                source="assessment",
                last_assessed_at=datetime.datetime.utcnow()
            )
            db.add(learner_skill)
        else:
            learner_skill.current_proficiency = new_prof
            learner_skill.confidence_score = new_conf
            learner_skill.last_assessed_at = datetime.datetime.utcnow()
            learner_skill.source = "adaptive_mastery"

        before_summary = f"Standard pace with introductory modules and routine practice checkpoints for {skill_name}."

        # A. Mark current items in active phase for this skill as Completed
        for item in active_phase.items:
            if item.skill_id == skill.id or item.item_type == "Learning":
                item.status = "Completed"
                item.completion_percentage = 100.0
                item.completed_at = datetime.datetime.utcnow()

        changes.append(RoadmapDiffItem(
            action="completed",
            title=f"Foundational Modules ({skill_name})",
            phase_title=active_phase.title,
            reason=f"Exemplary assessment score of {int(score)}% demonstrated comprehensive mastery; skipped redundant introductory content.",
            badge_color="emerald"
        ))

        # B. Accelerate / Unlock Next Phase
        if downstream_phases:
            next_phase = downstream_phases[0]
            next_phase.status = "In Progress"
            for n_item in next_phase.items:
                n_item.status = "Available"
                n_item.is_accelerated = True
                n_item.unlocked_at = datetime.datetime.utcnow()

            changes.append(RoadmapDiffItem(
                action="accelerated",
                title=f"Fast-Tracked {next_phase.title}",
                phase_title=next_phase.title,
                reason="Pre-requisite mastery verified ahead of schedule; unlocked advanced track immediately.",
                badge_color="purple"
            ))

        # C. Recommend Advanced Challenge Material
        advanced_challenge_title = f"⭐ Advanced Benchmark: {skill_name} Production Challenge"
        existing_adv = db.query(RoadmapItem).filter(
            RoadmapItem.phase_id == active_phase.id,
            RoadmapItem.title == advanced_challenge_title
        ).first()

        if not existing_adv:
            adv_item = RoadmapItem(
                phase_id=active_phase.id,
                skill_id=skill.id,
                order_index=len(active_phase.items) + 1,
                title=advanced_challenge_title,
                objective=f"State-of-the-art applied challenge tackling production-scale edge cases and benchmark optimizations in {skill_name}.",
                item_type="Project",
                difficulty="Advanced",
                estimated_minutes=120,
                status="Available",
                completion_percentage=0.0,
                prerequisites_summary="Unlocked via 90%+ Mastery score",
                is_accelerated=True,
                unlocked_at=datetime.datetime.utcnow()
            )
            db.add(adv_item)

        changes.append(RoadmapDiffItem(
            action="added",
            title=f"Advanced Production Challenge ({skill_name})",
            phase_title=active_phase.title,
            reason="Substituted basic exercises with an advanced industry-grade challenge project.",
            badge_color="emerald"
        ))

        after_summary = f"Roadmap accelerated: Core modules credited, downstream phase unlocked early, and advanced industry benchmark project added."
        summary_text = f"Mastery achieved in {skill_name} ({int(score)}% score). PathFinder accelerated your roadmap, bypassing redundant beginner modules and unlocking advanced specialized coursework."

    # =========================================================================
    # BRANCH 3: Steady Progression (80–89%) or Inactivity Refresher
    # =========================================================================
    else:
        new_prof = round(min(100.0, 0.5 * old_prof + 0.5 * score), 1)
        new_conf = min(0.9, round(old_conf + 0.1, 2))
        conf_change_str = f"{old_conf:.2f} → {new_conf:.2f} (Steady Confidence)"

        if not learner_skill:
            learner_skill = LearnerSkill(
                profile_id=profile.id,
                skill_id=skill.id,
                current_proficiency=new_prof,
                confidence_score=new_conf,
                source="assessment",
                last_assessed_at=datetime.datetime.utcnow()
            )
            db.add(learner_skill)
        else:
            learner_skill.current_proficiency = new_prof
            learner_skill.confidence_score = new_conf
            learner_skill.last_assessed_at = datetime.datetime.utcnow()

        before_summary = f"Scheduled checkpoint on {skill_name} with standard milestone pacing."

        # Mark first in-progress item completed and unlock next
        for item in active_phase.items:
            if item.status == "In Progress":
                item.status = "Completed"
                item.completion_percentage = 100.0
                item.completed_at = datetime.datetime.utcnow()
                break

        # Unlock next available item
        for item in active_phase.items:
            if item.status == "Available" or item.status == "Locked":
                item.status = "In Progress"
                item.unlocked_at = datetime.datetime.utcnow()
                break

        changes.append(RoadmapDiffItem(
            action="reviewed",
            title=f"Milestone Validated ({skill_name})",
            phase_title=active_phase.title,
            reason=f"Solid performance ({int(score)}% score) validated competency requirements.",
            badge_color="emerald"
        ))

        after_summary = f"Standard continuous progression maintained. Next sequential competency milestone activated."
        summary_text = f"Great work! You scored {int(score)}% on {skill_name}. Competency verified and next sequential milestone unlocked."

    # Inactivity scenario handler
    if req.trigger_type == "inactivity" or (req.days_inactive and req.days_inactive >= 14):
        refresher_title = f"🔄 15-Minute Rapid Refresher: {skill_name} Key Recap"
        existing_ref = db.query(RoadmapItem).filter(
            RoadmapItem.phase_id == active_phase.id,
            RoadmapItem.title == refresher_title
        ).first()

        if not existing_ref:
            ref_item = RoadmapItem(
                phase_id=active_phase.id,
                skill_id=skill.id,
                order_index=0,
                title=refresher_title,
                objective=f"Concise refresher to reactivate core concepts after a brief pause in study streak.",
                item_type="Revision",
                difficulty="Beginner",
                estimated_minutes=15,
                status="In Progress",
                is_remedial=True,
                unlocked_at=datetime.datetime.utcnow()
            )
            db.add(ref_item)

        changes.insert(0, RoadmapDiffItem(
            action="added",
            title="15-Minute Rapid Refresher",
            phase_title=active_phase.title,
            reason="Welcome back! A quick recap to reactivate mental models before tackling deep topics.",
            badge_color="blue"
        ))

    # Add AI Insight record
    insight = AIInsight(
        profile_id=profile.id,
        insight_type="Milestone" if score >= 90 else ("Gap" if score < 50 else "Trend"),
        message=summary_text,
        importance="High" if (score < 50 or score >= 90) else "Medium"
    )
    db.add(insight)

    db.commit()
    db.refresh(active_roadmap)

    formatted_roadmap = RoadmapService.format_roadmap_response(active_roadmap)

    return AdaptationResponse(
        success=True,
        title="PathFinder updated your roadmap",
        summary=summary_text,
        trigger_type=req.trigger_type,
        score=score,
        skill_name=skill_name,
        proficiency_change={
            "old_proficiency": old_prof,
            "new_proficiency": new_prof,
            "confidence_change": conf_change_str
        },
        before_state_summary=before_summary,
        after_state_summary=after_summary,
        changes=changes,
        adapted_roadmap=formatted_roadmap
    )

def adapt_roadmap_after_assessment(
    db: Session,
    attempt: AssessmentAttempt,
    weak_topics: List[str] = []
) -> Dict[str, Any]:
    """
    Backwards-compatible bridge for legacy assessment flow.
    """
    assessment = attempt.assessment
    req = AdaptationRequest(
        profile_id=attempt.profile_id,
        trigger_type="assessment",
        skill_id=assessment.skill_id if assessment else None,
        score=attempt.percentage,
        mistakes_identified=weak_topics
    )
    res = execute_roadmap_adaptation(db, req)
    return {
        "adapted": True,
        "advice": res.summary,
        "adaptive_action": res.changes[0].title if res.changes else "Roadmap updated",
        "remedial_created": any(c.action == "added" for c in res.changes),
        "accelerated_unlocked": any(c.action == "accelerated" for c in res.changes)
    }

