from typing import Dict, Any, List, Optional, Set
from app.models.models import LearningResource, LearnerProfile, CareerSkill, LearnerSkill, Prerequisite, Feedback
from app.schemas.schemas import ScoreBreakdown, RecommendationItem, ResourceRead

def calculate_recommendation_score(
    resource: LearningResource,
    profile: LearnerProfile,
    career_skills_map: Dict[int, CareerSkill],
    learner_skills_map: Dict[int, LearnerSkill],
    prerequisites_met_map: Dict[int, bool],
    recent_feedbacks: List[Feedback] = [],
    completed_resource_ids: Set[int] = set()
) -> Dict[str, Any]:
    """
    Computes a 10-factor normalized recommendation score (0-100% PathFinder Match)
    grounded directly in the learner's skill gaps, career goals, prerequisites,
    learning styles, time fit, and performance evidence.
    """
    skill_id = resource.primary_skill_id
    career_skill = career_skills_map.get(skill_id)
    learner_skill = learner_skills_map.get(skill_id)

    # 1. Skill Gap Weight (25 pts max)
    req_prof = career_skill.required_proficiency if career_skill else 80.0
    cur_prof = learner_skill.current_proficiency if learner_skill else 0.0
    gap = max(0.0, req_prof - cur_prof)
    gap_ratio = gap / max(1.0, req_prof)
    skill_gap_score = min(25.0, gap_ratio * 25.0)

    # 2. Goal Relevance (15 pts max)
    importance = career_skill.importance_weight if career_skill else 1.0
    goal_relevance_score = min(15.0, (importance / 2.0) * 15.0)

    # 3. Prerequisite Match (15 pts max)
    prereqs_met = prerequisites_met_map.get(skill_id, True)
    prereq_score = 15.0 if prereqs_met else 1.0

    # 4. Difficulty Match (10 pts max)
    diff_map = {"Beginner": 1, "Intermediate": 2, "Advanced": 3}
    user_level = diff_map.get(profile.experience_level, 2)
    res_level = diff_map.get(resource.difficulty, 2)
    level_diff = abs(user_level - res_level)
    difficulty_score = 10.0 if level_diff == 0 else (6.0 if level_diff == 1 else 2.0)

    # 5. Learning Style Match (10 pts max)
    pref_style = (profile.preferred_learning_style or "Mixed").lower()
    res_style = (resource.learning_style_tag or "Mixed").lower()
    res_type = (resource.type or "Course").lower()

    if pref_style == "mixed" or res_style == "mixed" or pref_style in res_style or res_style in pref_style:
        style_score = 10.0
    elif (pref_style == "hands-on" and resource.is_hands_on) or (pref_style == "project-based" and resource.project_oriented):
        style_score = 9.5
    elif pref_style == "video" and res_type == "video":
        style_score = 10.0
    elif pref_style == "reading" and res_type in ["article", "documentation", "tutorial"]:
        style_score = 10.0
    else:
        style_score = 5.0

    # 6. Time Budget Fit (5 pts max)
    weekly_hours = profile.weekly_hours or 10
    if resource.duration_hours <= weekly_hours:
        time_score = 5.0
    elif resource.duration_hours <= weekly_hours * 2:
        time_score = 3.5
    else:
        time_score = 2.0

    # 7. Previous Performance / Diagnostic Confidence (5 pts max)
    confidence = learner_skill.confidence_score if learner_skill else 0.5
    prior_perf_score = min(5.0, (1.0 - confidence * 0.5) * 5.0)

    # 8. Interest Match (5 pts max)
    interests = (profile.interests_text or "").lower()
    interest_score = 1.5
    if interests:
        keywords = [k.strip() for k in interests.replace(',', ' ').split() if len(k.strip()) > 2]
        res_text = f"{resource.title} {resource.description} {resource.skill.name if resource.skill else ''}".lower()
        matched_kw = [k for k in keywords if k in res_text]
        if len(matched_kw) >= 2:
            interest_score = 5.0
        elif len(matched_kw) == 1:
            interest_score = 3.5

    # 9. Feedback Signal (5 pts max)
    fb_score = 4.0
    for fb in recent_feedbacks:
        if fb.resource_id == resource.id:
            if fb.difficulty_feedback == "Just Right" or fb.rating >= 4:
                fb_score = 5.0
            elif fb.difficulty_feedback == "Too Difficult" and resource.difficulty == "Advanced":
                fb_score = 1.0
            elif fb.difficulty_feedback == "Too Easy" and resource.difficulty == "Beginner":
                fb_score = 2.0

    # 10. Completion History (5 pts max)
    if resource.id in completed_resource_ids:
        completion_score = 0.5  # Already completed
    elif cur_prof >= req_prof:
        completion_score = 1.5  # Skill already satisfied
    else:
        completion_score = 5.0  # Open gap to complete

    total_score = (
        skill_gap_score +
        goal_relevance_score +
        prereq_score +
        difficulty_score +
        style_score +
        time_score +
        prior_perf_score +
        interest_score +
        fb_score +
        completion_score
    )

    # Scale by resource quality factor
    quality_factor = (getattr(resource, 'quality_score', 92.0) or 92.0) / 100.0
    final_score = round(min(99.0, max(12.0, total_score * quality_factor)), 1)
    match_pct = int(round(final_score))

    # Determine priority tier
    if final_score >= 82:
        tier = "Top Match"
    elif final_score >= 68:
        tier = "High Priority"
    elif final_score >= 50:
        tier = "Recommended"
    else:
        tier = "Optional"

    breakdown = ScoreBreakdown(
        skill_gap_weight=round(skill_gap_score, 1),
        goal_relevance=round(goal_relevance_score, 1),
        prerequisite_match=round(prereq_score, 1),
        difficulty_match=round(difficulty_score, 1),
        learning_style_match=round(style_score, 1),
        time_fit=round(time_score, 1),
        feedback_signal=round(fb_score, 1),
        prior_performance=round(prior_perf_score, 1),
        interest_match=round(interest_score, 1),
        completion_history=round(completion_score, 1)
    )

    return {
        "score": final_score,
        "match_percentage": match_pct,
        "priority_tier": tier,
        "score_breakdown": breakdown,
        "prerequisites_met": prereqs_met,
        "gap": gap
    }
