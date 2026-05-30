"""WebSocket Connection Manager for real-time reasoning streaming."""
import json
import asyncio
import logging
from typing import Dict, Set
from fastapi import WebSocket

logger = logging.getLogger("axiomx.ws")


class ConnectionManager:
    """Manages WebSocket connections for live reasoning streams."""

    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = set()
        self.active_connections[session_id].add(websocket)
        logger.info(f"[WS] Client connected to session {session_id}")

    def disconnect(self, websocket: WebSocket, session_id: str):
        if session_id in self.active_connections:
            self.active_connections[session_id].discard(websocket)
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]
        logger.info(f"[WS] Client disconnected from session {session_id}")

    async def broadcast_to_session(self, session_id: str, data: dict):
        """Broadcast a reasoning event to all clients watching a session."""
        if session_id in self.active_connections:
            message = json.dumps(data)
            dead = set()
            for ws in self.active_connections[session_id]:
                try:
                    await ws.send_text(message)
                except Exception:
                    dead.add(ws)
            for ws in dead:
                self.active_connections[session_id].discard(ws)

    async def send_agent_event(
        self,
        session_id: str,
        agent_role: str,
        event_type: str,
        content: str,
        confidence: float | None = None,
        metadata: dict | None = None,
    ):
        """Send a structured agent reasoning event."""
        import time
        event = {
            "type": event_type,
            "agent": agent_role,
            "content": content,
            "confidence": confidence,
            "metadata": metadata or {},
            "timestamp": time.time(),
        }
        await self.broadcast_to_session(session_id, event)
