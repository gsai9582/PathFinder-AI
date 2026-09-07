import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import LearnerProfile, ChatMessage, Roadmap
from app.schemas.schemas import ChatMessageRequest, ChatMessageResponse
from app.ai.factory import get_ai_provider
from app.services.analytics_service import AnalyticsService

router = APIRouter()

@router.post("/chat", response_model=ChatMessageResponse)
def chat_with_assistant(req: ChatMessageRequest, db: Session = Depends(get_db)):
    """
    Context-aware AI conversational learning assistant.
    Answers learner queries using actual profile, roadmap, and progress context.
    """
    profile = db.query(LearnerProfile).filter(LearnerProfile.id == req.profile_id).first()
    if not profile:
        profile = db.query(LearnerProfile).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Learner profile not found.")

    # Save user message
    user_msg = ChatMessage(
        profile_id=profile.id,
        role="user",
        content=req.message,
        timestamp=datetime.datetime.utcnow()
    )
    db.add(user_msg)
    db.flush()

    # Build context
    readiness_data = AnalyticsService.calculate_readiness_score(db, profile)
    next_action = AnalyticsService.get_next_best_action(db, profile)
    
    learner_context = {
        "career_goal": profile.career_goal.title if profile.career_goal else "AI/ML Engineer",
        "experience_level": profile.experience_level,
        "readiness_score": readiness_data["score"],
        "next_action_title": next_action.title,
        "weekly_hours": profile.weekly_hours
    }

    # Fetch recent history
    history = db.query(ChatMessage).filter(ChatMessage.profile_id == profile.id).order_by(ChatMessage.timestamp.desc()).limit(6).all()
    history_dicts = [{"role": h.role, "content": h.content} for h in reversed(history)]

    # Generate response from AI
    ai_provider = get_ai_provider()
    res = ai_provider.chat_response(req.message, learner_context, history_dicts)

    assistant_msg = ChatMessage(
        profile_id=profile.id,
        role="assistant",
        content=res.get("content", "I am here to guide your learning path."),
        context_action=res.get("context_action"),
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
            "I only have 2 hours today",
            "How close am I to my goal?"
        ])
    )
