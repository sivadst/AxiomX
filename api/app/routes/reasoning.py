"""
Reasoning WebSocket routes — the heart of AXIOMX.
Handles live reasoning sessions with real-time streaming.
"""
import asyncio
import uuid
import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.agents.engine import LocalReasoningEngine

router = APIRouter()
logger = logging.getLogger("axiomx.reasoning")


@router.websocket("/ws/reasoning/{session_id}")
async def reasoning_websocket(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for live multi-agent reasoning.
    
    Client sends: { "query": "...", "scenario_mode": "business_strategy" }
    Server streams: agent events, thinking tokens, contradictions, final output
    """
    await websocket.accept()
    logger.info(f"[WS] Reasoning session connected: {session_id}")

    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)

            if payload.get("type") == "start_reasoning":
                query = payload.get("query", "")
                scenario_mode = payload.get("scenario_mode", "business_strategy")

                if not query:
                    await websocket.send_json({"type": "error", "message": "Query is required."})
                    continue

                # Create callback that sends events to this WebSocket
                async def ws_callback(sid: str, event: dict):
                    try:
                        await websocket.send_json(event)
                    except Exception:
                        pass

                engine = LocalReasoningEngine(ws_callback=ws_callback)

                # Run reasoning
                result = await engine.run_reasoning(session_id, query, scenario_mode)

                # Send final state
                await websocket.send_json({
                    "type": "session_complete",
                    "session_id": session_id,
                    "confidence": result["confidence"],
                    "total_steps": len(result["steps"]),
                    "steps": result["steps"],
                    "interactions": result["interactions"],
                    "graph_nodes": result["graph_nodes"],
                    "graph_edges": result["graph_edges"],
                    "contradictions": result["contradictions"],
                    "final_output": result["final_output"],
                })

            elif payload.get("type") == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        logger.info(f"[WS] Session {session_id} disconnected")
    except Exception as e:
        logger.error(f"[WS] Error in session {session_id}: {e}")
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass
