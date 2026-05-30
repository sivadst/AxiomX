"""Sessions management routes."""
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class SessionCreate(BaseModel):
    query: str
    scenario_mode: str = "business_strategy"


class SessionResponse(BaseModel):
    id: str
    status: str
    message: str


@router.post("/sessions", response_model=SessionResponse)
async def create_session(payload: SessionCreate):
    import uuid
    session_id = str(uuid.uuid4())
    return SessionResponse(
        id=session_id,
        status="created",
        message="Reasoning session initialized. Connect via WebSocket to begin.",
    )


@router.get("/sessions")
async def list_sessions():
    return {"sessions": [], "total": 0}
