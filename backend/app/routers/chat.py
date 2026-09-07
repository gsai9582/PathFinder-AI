from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import ChatMessageRequest, ChatMessageResponse, ChatHistoryResponse
from app.services.chat_service import ChatService

router = APIRouter()

@router.post("/chat", response_model=ChatMessageResponse)
def chat_with_assistant(req: ChatMessageRequest, db: Session = Depends(get_db)):
    return ChatService.process_message(db, req)

@router.get("/chat/history", response_model=ChatHistoryResponse)
def get_chat_history(profile_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    target_id = profile_id if profile_id is not None else 1
    return ChatService.get_history(db, target_id)

@router.delete("/chat/history")
def clear_chat_history(profile_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    target_id = profile_id if profile_id is not None else 1
    return ChatService.clear_history(db, target_id)
