from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.models import LearnerProfile, Progress, Project
from app.schemas.schemas import ProjectRead
from app.services.analytics_service import AnalyticsService

class ProgressService:
    @staticmethod
    def get_progress_data(db: Session, profile: LearnerProfile) -> Dict[str, Any]:
        return AnalyticsService.calculate_readiness_score(db, profile)

    @staticmethod
    def get_all_projects(db: Session) -> List[ProjectRead]:
        import json
        projects = db.query(Project).all()
        results = []
        for p in projects:
            try:
                objs = json.loads(p.learning_objectives_json)
            except Exception:
                objs = ["Build end-to-end model", "Evaluate performance"]
            try:
                tech = json.loads(p.tech_stack_json)
            except Exception:
                tech = ["Python", "FastAPI"]
            
            results.append(ProjectRead(
                id=p.id,
                title=p.title,
                slug=p.slug,
                difficulty=p.difficulty,
                primary_skill_id=p.primary_skill_id,
                skill_name=p.skill.name if p.skill else "Engineering",
                problem_statement=p.problem_statement,
                learning_objectives=objs,
                tech_stack=tech,
                estimated_hours=p.estimated_hours,
                expected_outcome=p.expected_outcome,
                template_repo_url=p.template_repo_url
            ))
        return results
