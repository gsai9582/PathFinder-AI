import json
import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.models import LearnerProfile, ChatMessage, RoadmapPhase, RoadmapItem, Project, Skill
from app.schemas.schemas import (
    ChatMessageRequest, ChatMessageResponse, ChatCitation, ChatActionLink, ChatHistoryResponse
)
from app.ai.factory import get_ai_provider
from app.services.analytics_service import AnalyticsService
from app.services.skill_gap_service import SkillGapService
from app.services.project_service import ProjectService
from app.services.roadmap_service import RoadmapService

class ChatService:
    @staticmethod
    def process_message(db: Session, req: ChatMessageRequest) -> ChatMessageResponse:
        profile = db.query(LearnerProfile).filter(LearnerProfile.id == req.profile_id).first()
        if not profile:
            profile = db.query(LearnerProfile).first()

        # Record user message
        user_msg = ChatMessage(
            profile_id=profile.id,
            role="user",
            content=req.message,
            timestamp=datetime.datetime.utcnow()
        )
        db.add(user_msg)
        db.flush()

        # Gather rich real-time context
        readiness_data = AnalyticsService.calculate_readiness_score(db, profile)
        next_action = AnalyticsService.get_next_best_action(db, profile)
        
        # Skill gaps
        top_gaps = []
        try:
            gap_analysis = SkillGapService.analyze_skill_gaps(db, profile)
            top_gaps = [
                {
                    "name": g.skill_name,
                    "current": g.current_proficiency,
                    "required": g.required_proficiency,
                    "gap": g.gap
                }
                for g in (gap_analysis.critical_gaps or gap_analysis.skill_gaps[:3])
            ]
        except Exception:
            top_gaps = [
                {"name": "Statistics", "current": 35.0, "required": 75.0, "gap": 40.0},
                {"name": "Machine Learning", "current": 20.0, "required": 80.0, "gap": 60.0}
            ]

        # Top projects
        top_projects = []
        try:
            proj_data = ProjectService.get_recommended_projects(db, profile.id)
            top_projects = [
                {
                    "title": p.project.title,
                    "difficulty": p.project.difficulty,
                    "hours": p.project.estimated_hours,
                    "skill": p.project.skill_name or "Machine Learning"
                }
                for p in proj_data.recommendations[:2]
            ]
        except Exception:
            pass

        # Active Roadmap phase
        current_phase = "Phase 3 — Machine Learning"
        try:
            roadmap = RoadmapService.get_or_create_roadmap(db, profile.id)
            for p in roadmap.phases:
                if p.status in ["In Progress", "Available"]:
                    current_phase = f"Phase {p.phase_number} — {p.title}"
                    break
        except Exception:
            pass

        learner_context = {
            "career_goal": profile.career_goal.title if profile.career_goal else "AI/ML Engineer",
            "experience_level": profile.experience_level,
            "readiness_score": readiness_data.get("score", 48.5),
            "next_action_title": next_action.title if next_action else "Decision Trees & Ensemble Methods",
            "next_action_time": next_action.estimated_minutes if next_action else 45,
            "next_action_skill": next_action.skill_name if next_action else "Machine Learning",
            "weekly_hours": profile.weekly_hours,
            "top_gaps": top_gaps,
            "top_projects": top_projects,
            "current_phase": current_phase
        }

        # Fetch recent chat history
        history = db.query(ChatMessage).filter(
            ChatMessage.profile_id == profile.id
        ).order_by(ChatMessage.timestamp.desc()).limit(8).all()
        history_dicts = [{"role": h.role, "content": h.content} for h in reversed(history)]

        ai_provider = get_ai_provider()
        res = ai_provider.chat_response(req.message, learner_context, history_dicts)

        citations_list = [
            ChatCitation(**c) if isinstance(c, dict) else c
            for c in res.get("citations", [])
        ]
        action_links_list = [
            ChatActionLink(**a) if isinstance(a, dict) else a
            for a in res.get("action_links", [])
        ]

        assistant_msg = ChatMessage(
            profile_id=profile.id,
            role="assistant",
            content=res.get("content", "I am here to guide your learning path."),
            context_action=res.get("context_action"),
            citations_json=json.dumps([c.dict() for c in citations_list]) if citations_list else None,
            action_links_json=json.dumps([a.dict() for a in action_links_list]) if action_links_list else None,
            timestamp=datetime.datetime.utcnow()
        )
        db.add(assistant_msg)
        db.commit()
        db.refresh(assistant_msg)

        return ChatMessageResponse(
            id=assistant_msg.id,
            role=assistant_msg.role,
            content=assistant_msg.content,
            context_action=assistant_msg.context_action,
            timestamp=assistant_msg.timestamp,
            suggested_quick_prompts=res.get("suggested_quick_prompts", [
                "What should I learn next?",
                "I only have 2 hours today.",
                "Explain my biggest skill gap.",
                "Give me a project.",
                "How close am I to my goal?"
            ]),
            citations=citations_list,
            action_links=action_links_list,
            is_fallback=res.get("is_fallback", False)
        )

    @staticmethod
    def get_history(db: Session, profile_id: int) -> ChatHistoryResponse:
        profile = db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
        if not profile:
            profile = db.query(LearnerProfile).first()

        messages = db.query(ChatMessage).filter(
            ChatMessage.profile_id == profile.id
        ).order_by(ChatMessage.timestamp.asc()).all()

        formatted = []
        for m in messages:
            citations = []
            if m.citations_json:
                try:
                    citations = [ChatCitation(**c) for c in json.loads(m.citations_json)]
                except Exception:
                    citations = []

            action_links = []
            if m.action_links_json:
                try:
                    action_links = [ChatActionLink(**a) for a in json.loads(m.action_links_json)]
                except Exception:
                    action_links = []

            formatted.append(
                ChatMessageResponse(
                    id=m.id,
                    role=m.role,
                    content=m.content,
                    context_action=m.context_action,
                    timestamp=m.timestamp,
                    suggested_quick_prompts=[],
                    citations=citations,
                    action_links=action_links,
                    is_fallback=False
                )
            )

        return ChatHistoryResponse(
            profile_id=profile.id,
            messages=formatted
        )

    @staticmethod
    def clear_history(db: Session, profile_id: int) -> Dict[str, Any]:
        profile = db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
        if not profile:
            profile = db.query(LearnerProfile).first()

        deleted = db.query(ChatMessage).filter(ChatMessage.profile_id == profile.id).delete()
        db.commit()
        return {"success": True, "deleted_count": deleted}
