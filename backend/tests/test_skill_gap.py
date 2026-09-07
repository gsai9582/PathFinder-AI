import pytest
from app.models.models import Skill, CareerSkill, LearnerSkill, LearnerProfile, CareerGoal, Prerequisite
from app.services.skill_gap_service import SkillGapService
from app.database import Base

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_skill_gap_calculation(test_db):
    # Setup career, skills, and learner
    career = CareerGoal(title="AI Engineer", slug="ai-eng", description="AI engineering")
    test_db.add(career)
    test_db.flush()

    s1 = Skill(name="Python", slug="python", category="Programming")
    s2 = Skill(name="Statistics", slug="statistics", category="Math")
    test_db.add_all([s1, s2])
    test_db.flush()

    cs1 = CareerSkill(career_id=career.id, skill_id=s1.id, required_proficiency=80.0, importance_weight=1.5)
    cs2 = CareerSkill(career_id=career.id, skill_id=s2.id, required_proficiency=80.0, importance_weight=1.5)
    test_db.add_all([cs1, cs2])
    test_db.flush()

    profile = LearnerProfile(user_id=1, career_goal_id=career.id, experience_level="Intermediate")
    test_db.add(profile)
    test_db.flush()

    # Learner has 80% Python (Strong) and 30% Statistics (Critical Gap)
    ls1 = LearnerSkill(profile_id=profile.id, skill_id=s1.id, current_proficiency=80.0, confidence_score=0.9)
    ls2 = LearnerSkill(profile_id=profile.id, skill_id=s2.id, current_proficiency=30.0, confidence_score=0.4)
    test_db.add_all([ls1, ls2])
    test_db.commit()

    response = SkillGapService.analyze_skill_gaps(test_db, profile)

    assert response.skills_count == 2
    assert response.critical_gaps_count == 1  # Statistics has gap of 50
    assert response.strong_skills_count == 1   # Python has gap of 0
    assert len(response.radar_data) == 2

    stat_item = next(item for item in response.skill_gaps if item.skill_name == "Statistics")
    assert stat_item.gap == 50.0
    assert stat_item.status == "Critical Gap"
    assert stat_item.priority == "Critical"

    python_item = next(item for item in response.skill_gaps if item.skill_name == "Python")
    assert python_item.gap == 0.0
    assert python_item.status == "Strong"

def test_skill_detail_retrieval(test_db):
    career = CareerGoal(title="AI Engineer", slug="ai-eng-2", description="AI engineering")
    test_db.add(career)
    test_db.flush()

    s1 = Skill(name="Python", slug="python-2", category="Programming", description="Core Python language")
    s2 = Skill(name="Machine Learning", slug="ml-2", category="AI/ML", description="ML Algorithms")
    test_db.add_all([s1, s2])
    test_db.flush()

    test_db.add(Prerequisite(skill_id=s2.id, prerequisite_skill_id=s1.id, min_proficiency_required=70.0))
    test_db.add(CareerSkill(career_id=career.id, skill_id=s2.id, required_proficiency=85.0, importance_weight=1.8))
    test_db.flush()

    profile = LearnerProfile(user_id=1, career_goal_id=career.id, experience_level="Intermediate")
    test_db.add(profile)
    test_db.flush()

    test_db.add(LearnerSkill(profile_id=profile.id, skill_id=s1.id, current_proficiency=80.0, confidence_score=0.9))
    test_db.add(LearnerSkill(profile_id=profile.id, skill_id=s2.id, current_proficiency=25.0, confidence_score=0.3))
    test_db.commit()

    detail = SkillGapService.get_skill_detail(test_db, profile, s2.id)
    assert detail is not None
    assert detail.skill_name == "Machine Learning"
    assert detail.current_proficiency == 25.0
    assert detail.required_proficiency == 85.0
    assert detail.gap == 60.0
    assert detail.status == "Critical Gap"
    assert detail.prerequisites_met is True
    assert len(detail.prerequisites) == 1
    assert detail.prerequisites[0].prerequisite_name == "Python"
    assert detail.prerequisites[0].is_satisfied is True


