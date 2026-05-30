"""Health check routes."""
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    return {
        "status": "operational",
        "system": "AXIOMX",
        "engine": "multi-agent-reasoning-v1",
        "agents_online": 8,
    }
