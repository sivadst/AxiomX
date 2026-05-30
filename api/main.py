"""
AXIOMX — Main FastAPI Application
Multi-Agent AI Reasoning Engine Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import get_settings
from app.routes import reasoning, sessions, health
from app.websockets.manager import ConnectionManager

settings = get_settings()
logger = logging.getLogger("axiomx")

# Global WebSocket manager
ws_manager = ConnectionManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    logger.info("🚀 AXIOMX Engine Starting...")
    logger.info(f"   Version: {settings.APP_VERSION}")
    logger.info(f"   Debug: {settings.DEBUG}")
    yield
    logger.info("🛑 AXIOMX Engine Shutting Down...")


app = FastAPI(
    title="AXIOMX — Multi-Agent AI Reasoning Engine",
    description="Next-generation autonomous intelligence platform with collaborative multi-agent reasoning.",
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(health.router, prefix=settings.API_PREFIX, tags=["Health"])
app.include_router(sessions.router, prefix=settings.API_PREFIX, tags=["Sessions"])
app.include_router(reasoning.router, prefix=settings.API_PREFIX, tags=["Reasoning"])


@app.get("/")
async def root():
    return {
        "system": "AXIOMX",
        "version": settings.APP_VERSION,
        "status": "OPERATIONAL",
        "engine": "Multi-Agent Reasoning v1.0",
        "agents_online": 8,
    }
