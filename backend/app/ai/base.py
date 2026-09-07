from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

class AIProvider(ABC):
    """Abstract interface for PathFinder AI intelligence."""

    @abstractmethod
    def analyze_career_goal(self, user_prompt: str) -> Dict[str, Any]:
        """Extracts structured career goal, skills, timeline, and weaknesses from free-form text."""
        pass

    @abstractmethod
    def generate_explanation(
        self,
        resource_title: str,
        skill_name: str,
        goal_title: str,
        gap: float,
        prereqs_met: bool,
        learning_style: str,
        weekly_hours: int
    ) -> str:
        """Generates a human-friendly 'Why this?' explanation for a recommended resource."""
        pass

    @abstractmethod
    def chat_response(
        self,
        message: str,
        learner_context: Dict[str, Any],
        conversation_history: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """Generates a contextual, action-oriented response from the AI learning assistant."""
        pass

    @abstractmethod
    def generate_adaptive_advice(
        self,
        assessment_title: str,
        skill_name: str,
        score_percentage: float,
        passed: bool,
        weak_topics: List[str]
    ) -> Dict[str, Any]:
        """Generates adaptive recommendation recommendations following an assessment attempt."""
        pass

    @abstractmethod
    def generate_assessment(
        self,
        skill_name: str,
        difficulty: str,
        career_goal: str,
        question_count: int = 4
    ) -> Dict[str, Any]:
        """Generates a dynamic assessment with MCQ, Conceptual, and Scenario questions."""
        pass

    @abstractmethod
    def generate_project_explanation(
        self,
        project_title: str,
        primary_skill: str,
        career_goal: str,
        gap: float,
        prereqs_met: bool,
        difficulty: str
    ) -> str:
        """Generates a personalized 'Why this project?' explanation."""
        pass
