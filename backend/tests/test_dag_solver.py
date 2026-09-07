import pytest
from app.models.models import Skill, CareerSkill, Prerequisite, LearnerSkill
from app.roadmap.dag_solver import PrerequisiteDAGSolver

def test_dag_prerequisite_ordering():
    s1 = Skill(id=1, name="Python", slug="python")
    s2 = Skill(id=2, name="Statistics", slug="statistics")
    s3 = Skill(id=3, name="Machine Learning", slug="ml")

    cs1 = CareerSkill(career_id=1, skill_id=1, required_proficiency=80.0, skill=s1)
    cs2 = CareerSkill(career_id=1, skill_id=2, required_proficiency=80.0, skill=s2)
    cs3 = CareerSkill(career_id=1, skill_id=3, required_proficiency=85.0, skill=s3)

    # ML requires both Python and Statistics
    p1 = Prerequisite(skill_id=3, prerequisite_skill_id=1, min_proficiency_required=60.0)
    p2 = Prerequisite(skill_id=3, prerequisite_skill_id=2, min_proficiency_required=60.0)

    solver = PrerequisiteDAGSolver([cs1, cs2, cs3], [p1, p2])

    # Case 1: Learner has 80% Python but only 30% Statistics -> ML prerequisites NOT met
    learner_map_incomplete = {
        1: LearnerSkill(profile_id=1, skill_id=1, current_proficiency=80.0),
        2: LearnerSkill(profile_id=1, skill_id=2, current_proficiency=30.0),
        3: LearnerSkill(profile_id=1, skill_id=3, current_proficiency=10.0)
    }
    met_map = solver.check_prerequisites_met(learner_map_incomplete)
    assert met_map[1] is True
    assert met_map[2] is True
    assert met_map[3] is False

    # Case 2: Learner reaches 70% Statistics -> ML prerequisites met
    learner_map_complete = {
        1: LearnerSkill(profile_id=1, skill_id=1, current_proficiency=80.0),
        2: LearnerSkill(profile_id=1, skill_id=2, current_proficiency=70.0),
        3: LearnerSkill(profile_id=1, skill_id=3, current_proficiency=10.0)
    }
    met_map2 = solver.check_prerequisites_met(learner_map_complete)
    assert met_map2[3] is True
