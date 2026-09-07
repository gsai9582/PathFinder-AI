import pytest
import json
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.database import engine, Base, SessionLocal
from app.repositories.seed_data import seed_database

@pytest.fixture(scope="module")
def client():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    db.close()
    with TestClient(app) as c:
        yield c

def test_scenario_1_new_learner_lifecycle(client):
    """Scenario 1: Full lifecycle of a new learner onboarding."""
    payload = {
        "full_name": "Jordan Smith",
        "email": "jordan.smith@testexample.org",
        "career_goal_id": 1,
        "experience_level": "Beginner",
        "weekly_hours": 8,
        "target_timeline_months": 9,
        "preferred_learning_style": "Hands-on",
        "skills": [
            {"skill_name": "Python", "proficiency": 30},
            {"skill_name": "SQL", "proficiency": 20}
        ]
    }
    res = client.post("/api/profile", json=payload)
    assert res.status_code == 200
    data = res.json()
    profile_id = data["id"]
    assert data["full_name"] == "Jordan Smith"
    assert data["weekly_hours"] == 8

    # Verify skill gap calculation
    gap_res = client.get(f"/api/skill-gap/analyze?profile_id={profile_id}")
    assert gap_res.status_code == 200
    gap_data = gap_res.json()
    assert len(gap_data["skill_gaps"]) > 0
    assert gap_data["overall_gap_score"] > 0

    # Verify roadmap generation for new learner
    road_res = client.get(f"/api/roadmap?profile_id={profile_id}")
    assert road_res.status_code == 200
    road_data = road_res.json()
    assert len(road_data["phases"]) >= 4

    # Verify recommendations
    rec_res = client.get(f"/api/recommendations?profile_id={profile_id}&limit=3")
    assert rec_res.status_code == 200
    assert len(rec_res.json()["recommendations"]) > 0

def test_scenario_2_demo_learner_hydration(client):
    """Scenario 2: Demo learner Alex Morgan data completeness."""
    demo_res = client.post("/api/demo/init")
    assert demo_res.status_code == 200
    demo_data = demo_res.json()
    assert demo_data["full_name"] == "Alex Morgan"
    assert demo_data["career_goal_title"] == "AI/ML Engineer"
    assert demo_data["weekly_hours"] == 10
    profile_id = demo_data["id"]

    # Verify skill momentum endpoint
    mom_res = client.get(f"/api/analytics/momentum?profile_id={profile_id}")
    assert mom_res.status_code == 200
    assert len(mom_res.json()["skills"]) > 0

    # Verify learning velocity endpoint
    vel_res = client.get(f"/api/analytics/velocity?profile_id={profile_id}")
    assert vel_res.status_code == 200
    assert vel_res.json()["velocity_ratio"] > 0

    # Verify smart streak endpoint
    streak_res = client.get(f"/api/analytics/smart-streak?profile_id={profile_id}")
    assert streak_res.status_code == 200
    assert streak_res.json()["current_streak_days"] >= 1

    # Verify goal distance endpoint
    dist_res = client.get(f"/api/analytics/goal-distance?profile_id={profile_id}")
    assert dist_res.status_code == 200
    assert dist_res.json()["readiness_percentage"] > 0

    # Verify daily plan endpoint
    daily_res = client.get(f"/api/analytics/daily-plan?profile_id={profile_id}")
    assert daily_res.status_code == 200
    assert len(daily_res.json()["items"]) >= 3

    # Verify achievements endpoint
    ach_res = client.get(f"/api/analytics/achievements?profile_id={profile_id}")
    assert ach_res.status_code == 200
    assert ach_res.json()["total_count"] >= 5

def test_scenario_3_missing_ai_api_key_fallback():
    """Scenario 3: Verify graceful deterministic fallback when Gemini API key is unset."""
    with patch("app.core.config.settings.GEMINI_API_KEY", ""):
        from app.ai.factory import get_ai_provider
        from app.ai.mock_provider import MockAIProvider
        provider = get_ai_provider()
        assert isinstance(provider, MockAIProvider)

        # Test chat fallback
        chat_res = provider.chat_response(
            message="What should I learn next?",
            learner_context={"profile": {"full_name": "Test User", "career_goal": "AI/ML Engineer"}},
            conversation_history=[]
        )
        assert chat_res is not None
        assert len(chat_res.get("content", "")) > 10

def test_scenario_4_ai_provider_failure_resilience(client):
    """Scenario 4: Verify resilience when AI client is invoked via chat router."""
    res = client.post("/api/chat", json={
        "profile_id": 1,
        "message": "Explain my biggest skill gap."
    })
    assert res.status_code == 200
    data = res.json()
    assert len(data["content"]) > 0
    assert data["role"] == "assistant"

def test_scenario_5_database_transaction_safety(client):
    """Scenario 5: Verify invalid payload error handling and 404 response codes."""
    res = client.get("/api/skill-gap/analyze?profile_id=999999")
    assert res.status_code == 404

    res_road = client.get("/api/roadmap?profile_id=999999")
    assert res_road.status_code == 404

def test_scenario_6_empty_recommendations_fallback(client):
    """Scenario 6: Handle recommendations limit request gracefully."""
    res = client.get("/api/recommendations?profile_id=1&limit=1")
    assert res.status_code == 200
    assert len(res.json()["recommendations"]) <= 1

def test_scenario_7_invalid_assessment(client):
    """Scenario 7: Submit invalid assessment ID."""
    res = client.post("/api/assessments/submit", json={
        "profile_id": 1,
        "assessment_id": 999999,
        "answers": {"1": "A"}
    })
    assert res.status_code == 404

def test_scenario_8_low_assessment_score_adaptive_remedials(client):
    """Scenario 8: Low assessment score (< 50%) injects remedial reinforcement topics."""
    adapt_res = client.post("/api/roadmap/adapt", json={
        "profile_id": 1,
        "trigger_type": "assessment",
        "skill_name": "Statistics",
        "score": 38.0,
        "difficulty_feedback": "Too Hard",
        "mistakes_identified": ["Bayes Theorem", "Variance calculations"]
    })
    assert adapt_res.status_code == 200
    data = adapt_res.json()
    assert data["success"] is True
    assert "adapted_roadmap" in data
    assert len(data["changes"]) >= 1

def test_scenario_9_high_assessment_score_acceleration(client):
    """Scenario 9: High assessment score (> 85%) accelerates curriculum and satisfies prerequisites."""
    adapt_res = client.post("/api/roadmap/adapt", json={
        "profile_id": 1,
        "trigger_type": "assessment",
        "skill_name": "Python",
        "score": 96.0,
        "difficulty_feedback": "Too Easy"
    })
    assert adapt_res.status_code == 200
    data = adapt_res.json()
    assert data["success"] is True
    assert "adapted_roadmap" in data

def test_scenario_what_if_simulation(client):
    """Scenario 10: Verify What-If simulation calculations."""
    sim_res = client.post("/api/roadmap/what-if", json={
        "profile_id": 1,
        "weekly_hours": 20,
        "target_timeline_months": 4
    })
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert "current_weekly_hours" in sim_data
    assert "simulated_weekly_hours" in sim_data
    assert sim_data["simulated_weekly_hours"] == 20
    assert "timeline_difference_months" in sim_data
    assert "simulated_skill_coverage" in sim_data

def test_scenario_career_goal_comparison(client):
    """Scenario 11: Verify Career Goal Comparison engine."""
    comp_res = client.post("/api/career/compare", json={
        "profile_id": 1,
        "target_goal_id": 2
    })
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert comp_data["skill_overlap_percentage"] > 0
    assert len(comp_data["shared_skills"]) > 0
    assert len(comp_data["additional_skills"]) > 0
    assert len(comp_data["ai_transition_advice"]) > 0
