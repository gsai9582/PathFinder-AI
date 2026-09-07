import pytest
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



def test_root_and_health(client):
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["status"] == "online"

    res = client.get("/health")
    assert res.status_code == 200
    assert "status" in res.json()

def test_nlp_goal_analyzer(client):
    payload = {
        "text": "I know Python and SQL but I'm weak in statistics. I want an AI engineer job in 6 months studying 10 hours a week."
    }
    res = client.post("/api/analyze-goal", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "AI/ML Engineer" in data["career_goal"] or "Engineer" in data["career_goal"]
    assert data["target_timeline_months"] == 6
    assert data["weekly_hours"] == 10
    assert "Python" in data["extracted_skills"] or "SQL" in data["extracted_skills"]

def test_demo_init_and_profile(client):
    res = client.post("/api/demo/init")
    assert res.status_code == 200
    data = res.json()
    assert data["full_name"] == "Alex Morgan"
    assert data["career_goal_title"] == "AI/ML Engineer"
    assert len(data["skills"]) > 0

def test_skill_gap_analysis(client):
    res = client.get("/api/skill-gap/analyze")
    assert res.status_code == 200
    data = res.json()
    assert data["career_goal_title"] == "AI/ML Engineer"
    assert len(data["radar_data"]) > 0
    assert len(data["skill_gaps"]) > 0
    assert data["critical_gaps_count"] >= 1
    assert "dependency_graph" in data
    assert len(data["dependency_graph"]["nodes"]) > 0

    # Test skill detail endpoint
    first_skill_id = data["skill_gaps"][0]["skill_id"]
    detail_res = client.get(f"/api/skill-gap/skill/{first_skill_id}")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert "skill_name" in detail_data
    assert "current_proficiency" in detail_data
    assert "required_proficiency" in detail_data
    assert "gap" in detail_data
    assert "status" in detail_data
    assert "ai_recommendation" in detail_data


def test_recommendations_and_why_this(client):
    res = client.get("/api/recommendations")
    assert res.status_code == 200
    data = res.json()
    assert len(data["recommendations"]) > 0
    
    first_res_id = data["recommendations"][0]["resource"]["id"]
    explain_res = client.get(f"/api/recommendations/explain?resource_id={first_res_id}")
    assert explain_res.status_code == 200
    explain_data = explain_res.json()
    assert "resource_title" in explain_data
    assert "ai_narrative_explanation" in explain_data

def test_roadmap_and_what_if(client):
    res = client.get("/api/roadmap")
    assert res.status_code == 200
    roadmap = res.json()
    assert len(roadmap["phases"]) > 0

    what_if_payload = {
        "profile_id": roadmap["profile_id"],
        "weekly_hours": 5,
        "target_timeline_months": 6
    }
    what_if_res = client.post("/api/roadmap/what-if", json=what_if_payload)
    assert what_if_res.status_code == 200
    what_if_data = what_if_res.json()
    assert what_if_data["simulated_weekly_hours"] == 5
    assert what_if_data["simulated_estimated_months"] > what_if_data["current_estimated_months"]

def test_chat_assistant(client):
    # Test 1: "What should I learn next?"
    chat_payload = {
        "profile_id": 1,
        "message": "What should I learn next?"
    }
    res = client.post("/api/chat", json=chat_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "assistant"
    assert len(data["content"]) > 10
    assert "citations" in data
    assert "action_links" in data

    # Test 2: "I only have 2 hours today."
    res2 = client.post("/api/chat", json={"profile_id": 1, "message": "I only have 2 hours today."})
    assert res2.status_code == 200
    data2 = res2.json()
    assert "60-Minute" in data2["content"] or "60-min" in data2["content"] or "Lesson" in data2["content"]
    assert len(data2["citations"]) >= 2

    # Test 3: "Explain my biggest skill gap."
    res3 = client.post("/api/chat", json={"profile_id": 1, "message": "Explain my biggest skill gap."})
    assert res3.status_code == 200
    data3 = res3.json()
    assert "Gap" in data3["content"] or "delta" in data3["content"] or "%" in data3["content"]

    # Test 4: "Give me a project."
    res4 = client.post("/api/chat", json={"profile_id": 1, "message": "Give me a project."})
    assert res4.status_code == 200
    data4 = res4.json()
    assert len(data4["action_links"]) >= 1

    # Test 5: Chat History
    hist_res = client.get("/api/chat/history?profile_id=1")
    assert hist_res.status_code == 200
    hist_data = hist_res.json()
    assert len(hist_data["messages"]) >= 8  # 4 user + 4 assistant

    # Test 6: Clear Chat History
    del_res = client.delete("/api/chat/history?profile_id=1")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    hist_res2 = client.get("/api/chat/history?profile_id=1")
    assert hist_res2.status_code == 200
    assert len(hist_res2.json()["messages"]) == 0


def test_roadmap_adaptation_endpoint(client):
    # Test low score remediation
    adapt_payload = {
        "profile_id": 1,
        "trigger_type": "assessment",
        "skill_name": "Machine Learning",
        "score": 42.0,
        "mistakes_identified": ["Decision Trees Gini Impurity"]
    }
    res = client.post("/api/roadmap/adapt", json=adapt_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["title"] == "PathFinder updated your roadmap"
    assert data["score"] == 42.0
    assert len(data["changes"]) > 0
    assert any(c["action"] == "added" for c in data["changes"])
    assert "adapted_roadmap" in data

def test_project_recommendations_and_detail(client):
    # Test list projects
    res = client.get("/api/projects")
    assert res.status_code == 200
    projects = res.json()
    assert len(projects) >= 7

    # Verify flagship projects exist
    titles = [p["title"] for p in projects]
    assert any("Expense Tracker" in t for t in titles)
    assert any("Customer Churn" in t for t in titles)
    assert any("Recommendation System" in t for t in titles)
    assert any("RAG" in t for t in titles)

    # Test project recommendations
    rec_res = client.get("/api/projects/recommendations")
    assert rec_res.status_code == 200
    rec_data = rec_res.json()
    assert "recommendations" in rec_data
    assert len(rec_data["recommendations"]) > 0
    first_rec = rec_data["recommendations"][0]
    assert "why_this_project" in first_rec
    assert first_rec["match_score"] > 0
    assert "readiness_status" in first_rec

    # Test project detail
    detail_res = client.get(f"/api/projects/{projects[0]['id']}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert "milestones" in detail
    assert "prerequisites" in detail
    assert "portfolio_value" in detail

def test_assessment_generation_and_submission(client):
    # Test dynamic generation
    gen_payload = {
        "skill_name": "Machine Learning",
        "difficulty": "Intermediate",
        "career_goal": "AI/ML Engineer",
        "question_count": 4
    }
    gen_res = client.post("/api/assessment/generate", json=gen_payload)
    assert gen_res.status_code == 200
    assessment = gen_res.json()
    assert assessment["questions_count"] == 4
    assert len(assessment["questions"]) == 4

    # Test submission
    q1 = assessment["questions"][0]
    submit_payload = {
        "profile_id": 1,
        "assessment_id": assessment["id"],
        "answers": {q1["id"]: q1["options"][0]}
    }
    sub_res = client.post("/api/assessment/submit", json=submit_payload)
    assert sub_res.status_code == 200
    sub_data = sub_res.json()
    assert "percentage" in sub_data
    assert "previous_proficiency" in sub_data
    assert "new_proficiency" in sub_data
    assert "previous_confidence" in sub_data
    assert "new_confidence" in sub_data
    assert "recommended_action" in sub_data
    assert "question_results" in sub_data


def test_advanced_ux_endpoints(client):
    # 1. Skill Momentum
    res = client.get("/api/analytics/momentum?profile_id=1")
    assert res.status_code == 200
    mom = res.json()
    assert "overall_momentum_label" in mom
    assert len(mom["skills"]) > 0
    assert any("trend_display" in s for s in mom["skills"])

    # 2. Learning Velocity
    res = client.get("/api/analytics/velocity?profile_id=1")
    assert res.status_code == 200
    vel = res.json()
    assert vel["status"] in ["Ahead", "On Track", "Behind"]
    assert "velocity_ratio" in vel

    # 3. Smart Streak
    res = client.get("/api/analytics/smart-streak?profile_id=1")
    assert res.status_code == 200
    streak = res.json()
    assert streak["current_streak_days"] >= 1
    assert len(streak["recent_milestones"]) > 0

    # 4. Goal Distance
    res = client.get("/api/analytics/goal-distance?profile_id=1")
    assert res.status_code == 200
    dist = res.json()
    assert dist["demonstrated_competencies_percentage"] > 0
    assert "remaining_gaps" in dist

    # 5. Roadmap Changelog
    res = client.get("/api/roadmap/changelog?profile_id=1")
    assert res.status_code == 200
    change = res.json()
    assert len(change["changelog"]) >= 3

    # 6. Daily Plan
    res = client.get("/api/analytics/daily-plan?profile_id=1")
    assert res.status_code == 200
    plan = res.json()
    assert plan["total_minutes"] >= 90
    assert len(plan["items"]) == 4

    # 7. Achievements
    res = client.get("/api/analytics/achievements?profile_id=1")
    assert res.status_code == 200
    ach = res.json()
    assert len(ach["achievements"]) >= 5
    assert ach["unlocked_count"] >= 1

    # 8. Career Goal Comparison
    careers_res = client.get("/api/careers")
    careers = careers_res.json()
    target_career_id = careers[1]["id"] if len(careers) > 1 else careers[0]["id"]
    
    comp_res = client.post("/api/career/compare", json={"profile_id": 1, "target_goal_id": target_career_id})
    assert comp_res.status_code == 200
    comp = comp_res.json()
    assert comp["skill_overlap_percentage"] > 0
    assert len(comp["shared_skills"]) > 0
    assert "transition_feasibility" in comp


