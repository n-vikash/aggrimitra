from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, delete
from ..database import SessionLocal, Conversation, Message
from ..schemas import ChatRequest, ChatResponse
from ..services.groq_service import GroqService, LLMServiceError
from ..config import get_settings

router = APIRouter(prefix="/api", tags=["chat"])
def db():
    session = SessionLocal()
    try: yield session
    finally: session.close()

def get_messages(session, conversation_id):
    return [{"role": m.role, "content": m.content} for m in session.scalars(select(Message).where(Message.conversation_id == conversation_id).order_by(Message.id)).all()]

@router.get("/conversations")
def list_conversations(session: Session = Depends(db)):
    return [{"id": c.id, "title": c.title, "language": c.language, "updated_at": c.updated_at} for c in session.scalars(select(Conversation).order_by(Conversation.updated_at.desc()).limit(30)).all()]

@router.get("/conversations/{conversation_id}")
def get_conversation(conversation_id: int, session: Session = Depends(db)):
    conversation = session.get(Conversation, conversation_id)
    if not conversation: raise HTTPException(404, "Conversation not found")
    return {"id": conversation.id, "title": conversation.title, "language": conversation.language, "messages": get_messages(session, conversation.id)}

@router.delete("/conversations/{conversation_id}")
def delete_conversation(conversation_id: int, session: Session = Depends(db)):
    conversation = session.get(Conversation, conversation_id)
    if not conversation: raise HTTPException(404, "Conversation not found")
    session.execute(delete(Message).where(Message.conversation_id == conversation_id))
    session.delete(conversation); session.commit(); return {"ok": True}

@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, session: Session = Depends(db)):
    conversation = session.get(Conversation, request.conversation_id) if request.conversation_id else None
    if conversation is None:
        conversation = Conversation(title=request.message[:70], language=request.language); session.add(conversation); session.flush()
    history = get_messages(session, conversation.id)
    history.append({"role": "user", "content": request.message})
    try: reply = GroqService(get_settings()).complete(history, request.language)
    except LLMServiceError as exc: raise HTTPException(503, str(exc))
    session.add_all([Message(conversation_id=conversation.id, role="user", content=request.message), Message(conversation_id=conversation.id, role="assistant", content=reply)])
    conversation.language = request.language; session.commit()
    return ChatResponse(conversation_id=conversation.id, reply=reply)
