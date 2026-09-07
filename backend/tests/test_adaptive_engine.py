import pytest
from app.models.models import (
    User, LearnerProfile, CareerGoal, Skill, Assessment, AssessmentAttempt,
    Roadmap, RoadmapPhase, RoadmapItem, LearnerSkill
)
from app.roadmap.adaptive_engine import adapt_roadmap_after_assessment
from app.database import Base
from sqlalchemy import create_engine

from sqlalchemy.orm import sessionmaker

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_adaptive_remediation_on_low_score(db_session):
    # Setup test entities
    user = User(email="test@example.com", full_name="Test User")
    db_session.add(user)
    db_session.flush()

    career = CareerGoal(title="AI Engineer", slug="ai-eng", description="AI")
    skill = Skill(name="Machine Learning", slug="ml", category="AI")
    db_session.add_all([career, skill])
    db_session.flush()

    profile = LearnerProfile(user_id=user.id, career_goal_id=career.id)
    db_session.add(profile)
    db_session.flush()

    learner_skill = LearnerSkill(profile_id=profile.id, skill_id=skill.id, current_proficiency=30.0, confidence_score=0.4)
    db_session.add(learner_skill)

    roadmap = Roadmap(profile_id=profile.id, career_goal_id=career.id, title="Path", is_active=True)
    db_session.add(roadmap)
    db_session.flush()

    phase = RoadmapPhase(roadmap_id=roadmap.id, phase_number=1, title="Phase 1", status="In Progress")
    db_session.add(phase)
    db_session.flush()

    assessment = Assessment(title="ML Basics", skill_id=skill.id, difficulty="Intermediate", passing_score=70.0)
    db_session.add(assessment)
    db_session.flush()

    # Attempt with low score (40%)
    attempt = AssessmentAttempt(
        profile_id=profile.id,
        assessment_id=assessment.id,
        score=4,
        max_score=10,
        percentage=40.0,
        passed=False
    )
    db_session.add(attempt)
    db_session.flush()

    result = adapt_roadmap_after_assessment(db_session, attempt, weak_topics=["Decision Trees"])

    assert result["adapted"] is True
    assert result["remedial_created"] is True

    # Verify remedial item was inserted
    remedial_item = db_session.query(RoadmapItem).filter(
        RoadmapItem.phase_id == phase.id,
        RoadmapItem.is_remedial == True
    ).first()
    assert remedial_item is not None
    assert "Reinforcement" in remedial_item.title or "Remedial" in remedial_item.title


def test_execute_roadmap_adaptation_high_score(db_session):
    from app.schemas.schemas import AdaptationRequest
    from app.roadmap.adaptive_engine import execute_roadmap_adaptation

    user = User(email="alex@example.com", full_name="Alex High")
    db_session.add(user)
    db_session.flush()

    career = CareerGoal(title="AI Engineer", slug="ai-eng-2", description="AI")
    skill = Skill(name="Deep Learning", slug="dl-2", category="AI")
    db_session.add_all([career, skill])
    db_session.flush()

    profile = LearnerProfile(user_id=user.id, career_goal_id=career.id)
    db_session.add(profile)
    db_session.flush()

    roadmap = Roadmap(profile_id=profile.id, career_goal_id=career.id, title="Path DL", is_active=True)
    db_session.add(roadmap)
    db_session.flush()

    phase1 = RoadmapPhase(roadmap_id=roadmap.id, phase_number=1, title="Phase 1", status="In Progress")
    phase2 = RoadmapPhase(roadmap_id=roadmap.id, phase_number=2, title="Phase 2", status="Locked")
    db_session.add_all([phase1, phase2])
    db_session.flush()

    item1 = RoadmapItem(phase_id=phase1.id, skill_id=skill.id, title="DL Basics", status="In Progress")
    item2 = RoadmapItem(phase_id=phase2.id, skill_id=skill.id, title="Advanced CNNs", status="Locked")
    db_session.add_all([item1, item2])
    db_session.flush()

    req = AdaptationRequest(
        profile_id=profile.id,
        trigger_type="assessment",
        skill_id=skill.id,
        score=95.0
    )

    res = execute_roadmap_adaptation(db_session, req)

    assert res.success is True
    assert res.score == 95.0
    assert any(c.action == "accelerated" for c in res.changes)
    assert any(c.action == "completed" for c in res.changes)
    assert res.title == "PathFinder updated your roadmap"

