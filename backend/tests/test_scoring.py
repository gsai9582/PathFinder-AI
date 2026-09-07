import pytest
from app.models.models import LearningResource, LearnerProfile, CareerSkill, LearnerSkill
from app.recommendation.scoring import calculate_recommendation_score

def test_recommendation_scoring_high_gap():
    resource = LearningResource(
        id=1,
        primary_skill_id=1,
        title="Applied Statistics Masterclass",
        type="Course",
        difficulty="Intermediate",
        duration_hours=6.0,
        rating=4.9,
        url="https://example.com",
        description="Statistics course",
        is_free=True,
        is_hands_on=True,
        learning_style_tag="Mixed"
    )

    profile = LearnerProfile(
        id=1,
        user_id=1,
        experience_level="Intermediate",
        preferred_learning_style="Mixed",
        weekly_hours=10
    )

    career_skill = CareerSkill(career_id=1, skill_id=1, required_proficiency=80.0, importance_weight=1.8)
    learner_skill = LearnerSkill(profile_id=1, skill_id=1, current_proficiency=20.0, confidence_score=0.3)

    career_skills_map = {1: career_skill}
    learner_skills_map = {1: learner_skill}
    prereqs_met_map = {1: True}

    result = calculate_recommendation_score(
        resource=resource,
        profile=profile,
        career_skills_map=career_skills_map,
        learner_skills_map=learner_skills_map,
        prerequisites_met_map=prereqs_met_map
    )

    assert result["score"] >= 70.0
    assert result["priority_tier"] in ["Top Match", "High Priority"]
    assert result["gap"] == 60.0
    assert result["score_breakdown"].skill_gap_weight > 15.0
    assert result["score_breakdown"].prerequisite_match == 15.0
    assert result["score_breakdown"].learning_style_match == 10.0


def test_recommendation_scoring_prerequisite_unmet_penalty():
    resource = LearningResource(
        id=2,
        primary_skill_id=2,
        title="Advanced Deep Learning",
        type="Course",
        difficulty="Advanced",
        duration_hours=20.0,
        rating=4.8,
        url="https://example.com",
        description="Deep learning course",
        is_free=False,
        is_hands_on=True,
        learning_style_tag="Visual"
    )

    profile = LearnerProfile(
        id=1,
        user_id=1,
        experience_level="Beginner",
        preferred_learning_style="Hands-on",
        weekly_hours=5
    )

    career_skill = CareerSkill(career_id=1, skill_id=2, required_proficiency=90.0, importance_weight=1.5)
    learner_skill = LearnerSkill(profile_id=1, skill_id=2, current_proficiency=10.0, confidence_score=0.2)

    result = calculate_recommendation_score(
        resource=resource,
        profile=profile,
        career_skills_map={2: career_skill},
        learner_skills_map={2: learner_skill},
        prerequisites_met_map={2: False}  # Prereq NOT met
    )

    # Prerequisite penalty cuts prerequisite score down to minimum (1.0 vs 15.0)
    assert result["score_breakdown"].prerequisite_match <= 2.0
    assert result["score"] < 70.0
    assert result["priority_tier"] in ["Recommended", "Optional", "Future Opportunity"]

