from fastapi import APIRouter
from pydantic import BaseModel
from app.services.chatbot import get_bot_response

router = APIRouter(prefix="/api/chat", tags=["Chatbot"])


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
    intent: str
    timestamp: str


@router.post("/message", response_model=ChatResponse)
async def chat(req: ChatRequest):
    result = get_bot_response(req.message)
    return ChatResponse(**result)
