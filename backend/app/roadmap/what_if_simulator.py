from typing import Dict, Any, List
from app.models.models import LearnerProfile, Roadmap
from app.schemas.schemas import WhatIfRequest, WhatIfResponse

def simulate_roadmap_impact(
    profile: LearnerProfile,
    roadmap: Roadmap,
    request: WhatIfRequest
) -> WhatIfResponse:
    """
    Simulates the impact of changing study hours, focus mode, and target deadlines
    on the overall roadmap timeline and phase duration.
    """
    current_weekly_hours = profile.weekly_hours or 10
    simulated_weekly_hours = request.weekly_hours
    total_hours = roadmap.total_estimated_hours if roadmap and roadmap.total_estimated_hours > 0 else 180.0

    # Calculate estimated months (assuming 4.33 weeks per month)
    current_months = round(total_hours / (current_weekly_hours * 4.33), 1)
    simulated_months = round(total_hours / (simulated_weekly_hours * 4.33), 1)
    diff = round(simulated_months - current_months, 1)

    # Feasibility status
    target_months = request.target_timeline_months or profile.target_timeline_months or 6
    if simulated_months <= target_months:
        feasibility = "Highly Realistic"
        pacing_advice = f"At {simulated_weekly_hours} hrs/week, you will comfortably reach your career milestone in approximately {simulated_months} months ({abs(diff)} months ahead of standard baseline)."
    elif simulated_months <= target_months * 1.25:
        feasibility = "Achievable with Focused Effort"
        pacing_advice = f"At {simulated_weekly_hours} hrs/week, completion is estimated at {simulated_months} months. Slightly increasing weekend sessions by 2 hours will bring you strictly within your target {target_months}-month goal."
    else:
        feasibility = "High Risk of Timeline Delay"
        pacing_advice = f"Studying {simulated_weekly_hours} hrs/week extends your roadmap to {simulated_months} months, exceeding your target {target_months}-month window. We recommend prioritizing Critical Gaps and utilizing Fast-Track modules."

    # Phase comparisons
    phase_comparisons = []
    if roadmap and roadmap.phases:
        for p in roadmap.phases:
            p_hours = p.estimated_hours or 24.0
            cur_p_weeks = round(p_hours / current_weekly_hours, 1)
            sim_p_weeks = round(p_hours / simulated_weekly_hours, 1)
            phase_comparisons.append({
                "phase_number": p.phase_number,
                "title": p.title,
                "estimated_hours": p_hours,
                "current_weeks": cur_p_weeks,
                "simulated_weeks": sim_p_weeks,
                "difference_weeks": round(sim_p_weeks - cur_p_weeks, 1)
            })
    else:
        # Fallback phase mock
        for i in range(1, 6):
            phase_comparisons.append({
                "phase_number": i,
                "title": f"Phase {i}",
                "estimated_hours": 30.0,
                "current_weeks": round(30.0 / current_weekly_hours, 1),
                "simulated_weeks": round(30.0 / simulated_weekly_hours, 1),
                "difference_weeks": round(30.0 / simulated_weekly_hours - 30.0 / current_weekly_hours, 1)
            })

    adjustments = [
        f"Pacing updated to {simulated_weekly_hours} hours per week.",
        "Practice exercises prioritized based on critical skill gaps.",
        "Milestone assessment checkpoints aligned to weekly sprints."
    ]
    if request.focus_mode == "fast_track":
        adjustments.append("Fast-Track Mode enabled: Optional deep-dive articles converted to supplementary reading.")
    elif request.focus_mode == "project_heavy" or request.project_preference == "project_heavy":
        adjustments.append("Project-Heavy Mode: Hands-on mini-projects emphasized for each phase.")

    # Calculate comparative task & project volume
    current_weekly_tasks = max(2, int(current_weekly_hours / 2.5))
    simulated_weekly_tasks = max(2, int(simulated_weekly_hours / 2.5))

    base_projects = 5
    sim_projects = base_projects + (2 if request.project_preference == "project_heavy" else (0 if request.project_preference == "balanced" else -1))
    
    current_coverage = 72.0
    sim_coverage = min(98.0, round(current_coverage + (simulated_weekly_hours - current_weekly_hours) * 1.5, 1)) if simulated_weekly_hours >= current_weekly_hours else max(50.0, round(current_coverage - (current_weekly_hours - simulated_weekly_hours) * 1.8, 1))

    # Calculate completion date string
    import datetime
    now = datetime.datetime.utcnow()
    cur_date = now + datetime.timedelta(days=int(current_months * 30))
    sim_date = now + datetime.timedelta(days=int(simulated_months * 30))

    return WhatIfResponse(
        current_weekly_hours=current_weekly_hours,
        current_estimated_months=current_months,
        current_weekly_tasks=current_weekly_tasks,
        current_project_count=base_projects,
        current_skill_coverage=current_coverage,
        current_completion_date=cur_date.strftime("%B %Y"),
        simulated_weekly_hours=simulated_weekly_hours,
        simulated_estimated_months=simulated_months,
        simulated_weekly_tasks=simulated_weekly_tasks,
        simulated_project_count=sim_projects,
        simulated_skill_coverage=sim_coverage,
        simulated_completion_date=sim_date.strftime("%B %Y"),
        timeline_difference_months=diff,
        feasibility_status=feasibility,
        weekly_pacing_advice=pacing_advice,
        phase_timeline_comparisons=phase_comparisons,
        recommended_adjustments=adjustments
    )
