"""
AXIOMX — LangGraph Production Reasoning Engine
══════════════════════════════════════════════

Replaces the local mocked engine with real GPT-4o reasoning,
token-by-token streaming, and LangGraph-driven topology.
"""
import asyncio
import time
import random
import logging
from typing import TypedDict, Annotated, Sequence, Any
from dataclasses import dataclass, field
import operator

from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END
from pydantic import BaseModel, Field

from app.core.config import get_settings
from app.agents.engine import AGENT_PROFILES, AgentProfile, ThoughtCollision

logger = logging.getLogger("axiomx.agents.langgraph")
settings = get_settings()

# We need the real OpenAI model
llm = ChatOpenAI(
    model=settings.OPENAI_MODEL,
    api_key=settings.OPENAI_API_KEY,
    temperature=0.7,
    max_tokens=4000,
    streaming=True,
)

# ─── Reasoning State ────────────────────────────────────────────────────────

class GraphReasoningState(TypedDict):
    query: str
    scenario_mode: str
    session_id: str
    current_agent: str
    steps: list[dict]
    interactions: list[dict]
    graph_nodes: list[dict]
    graph_edges: list[dict]
    confidence: float
    confidence_history: list[dict]
    contradictions: list[dict]
    thought_collisions: list[dict]
    final_output: str | None
    iteration: int
    max_iterations: int
    messages: Annotated[list[BaseMessage], operator.add]
    ws_callback: Any
    next_node: str

# ─── Streaming & Emitting Utilities ─────────────────────────────────────────

async def emit(state: GraphReasoningState, event_type: str, data: dict):
    if state.get("ws_callback"):
        data["timestamp"] = time.time()
        await state["ws_callback"](state["session_id"], data)

def compute_confidence(state: GraphReasoningState, result_conf: float, profile: AgentProfile, collision_severity: float = 0.0) -> float:
    base = result_conf
    biased = base + profile.confidence_bias
    if state["confidence"] > 0:
        weight = 0.4 if profile.contrarian_tendency < 0.5 else 0.6
        blended = state["confidence"] * (1 - weight) + biased * weight
    else:
        blended = biased
    
    if collision_severity > 0:
        blended -= collision_severity * 0.15
        
    return max(0.05, min(0.98, blended))

def calc_importance(confidence: float, has_collision: bool) -> float:
    if has_collision:
        return min(1.0, confidence + 0.3)
    return confidence

# ─── Agent Node Implementation ──────────────────────────────────────────────

async def execute_agent_node(state: GraphReasoningState, agent_role: str, profile: AgentProfile, instructions: str):
    start_time = time.time()
    
    # 1. Activation Emit
    state["iteration"] += 1
    iteration = state["iteration"]
    
    await emit(state, "agent_start", {
        "type": "agent_start",
        "agent": agent_role,
        "agent_name": profile.name,
        "agent_color": profile.color,
        "agent_icon": profile.icon,
        "personality": profile.personality,
        "step": iteration,
        "total_steps": state["max_iterations"],
        "thinking_speed": profile.thinking_speed,
        "confidence_bias": profile.confidence_bias,
        "contrarian_tendency": profile.contrarian_tendency,
        "emotional_intensity": profile.emotional_intensity,
    })
    
    await asyncio.sleep(0.3 * profile.thinking_speed)
    
    # 2. Build Context and Prompt
    context_str = ""
    for step in state["steps"][-3:]:
        context_str += f"\n[{step['agent_name']}]: {step['thought']}"
        
    system_prompt = f"""You are {profile.name}, {profile.description}.
Personality: {profile.personality}
Role Instruction: {instructions}
Your confidence bias is {profile.confidence_bias} and emotional intensity is {profile.emotional_intensity}.

Context of previous thoughts: {context_str}

Analyze the user's query: '{state["query"]}'
Provide your reasoning directly. Do not act like an AI, act purely as the cognitive sub-system described.
"""

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=state["query"])
    ]
    
    # 3. Stream LLM output and emit chunks
    full_response = ""
    chunk_id = 0
    
    async for chunk in llm.astream(messages):
        content = chunk.content
        if content:
            full_response += content
            await emit(state, "agent_thought_chunk", {
                "type": "agent_thought_chunk",
                "agent": agent_role,
                "chunk": content,
                "chunk_id": chunk_id,
            })
            chunk_id += 1
            # Slight dynamic delay for UI cinematic feel (token typing)
            await asyncio.sleep(0.005)
            
    # 4. Synthesize results
    # We heuristically extract confidence based on sentiment/profile, or we could prompt for it.
    # For speed and cinematic feel, we'll calculate it algorithmically based on profile + a baseline
    base_confidence = 0.5 + (random.uniform(-0.1, 0.1)) 
    
    # Determine if there's a collision based on contrarian tendency and mode
    is_collision = False
    collision_severity = 0.0
    collision_data = None
    
    # In debate mode, collisions are highly likely. In normal mode, based on contrarian tendency.
    collision_threshold = 0.3 if state["scenario_mode"] == "ai_debate_arena" else 0.8
    if random.random() < (profile.contrarian_tendency + (0.4 if state["scenario_mode"] == "ai_debate_arena" else 0.0)):
        if random.random() > collision_threshold and len(state["steps"]) > 0:
            is_collision = True
            collision_severity = min(0.95, round(random.uniform(0.5, 0.9), 2))
            
            target_step = random.choice(state["steps"])
            collision_type = random.choice(["assumption_challenge", "evidence_dispute", "logic_break", "confidence_divergence"])
            
            collision_data = {
                "id": f"collision-{len(state['thought_collisions'])}",
                "aggressor_agent": agent_role,
                "target_agent": target_step["agent"],
                "collision_type": collision_type,
                "severity": collision_severity,
                "description": f"{profile.name} strongly disputes {target_step['agent_name']}'s conclusion.",
                "aggressor_argument": full_response[:100] + "...",
                "target_argument": target_step["thought"][:100] + "...",
                "resolved": False,
                "ripple_agents": ["verifier", "risk_analyst"],
            }
            state["thought_collisions"].append(collision_data)
            
            # Emit collision event immediately
            await emit(state, "thought_collision", {
                "type": "thought_collision",
                "collision": collision_data,
                "severity": collision_severity,
                "aggressor": agent_role,
                "aggressor_name": profile.name,
                "aggressor_color": profile.color,
                "target": target_step["agent"],
                "target_name": AGENT_PROFILES[target_step["agent"]].name,
                "target_color": AGENT_PROFILES[target_step["agent"]].color,
                "collision_type": collision_type,
                "ripple_agents": collision_data["ripple_agents"],
            })

    # 5. Graph and Confidence Updates
    old_confidence = state["confidence"]
    new_confidence = compute_confidence(state, base_confidence, profile, collision_severity)
    state["confidence"] = new_confidence
    state["confidence_history"].append({
        "agent": agent_role,
        "from": old_confidence,
        "to": new_confidence,
        "delta": new_confidence - old_confidence,
    })
    
    node_id_num = len(state["graph_nodes"])
    current_node_id = f"node-{node_id_num}"
    prev_node_id = state["graph_nodes"][-1]["id"] if state["graph_nodes"] else "node-0"
    
    node = {
        "id": current_node_id,
        "type": agent_role,
        "label": full_response[:120],
        "agent": agent_role,
        "agent_name": profile.name,
        "confidence": new_confidence,
        "color": profile.color,
        "importance": calc_importance(new_confidence, is_collision),
        "is_contradiction": is_collision,
        "pulse_intensity": collision_severity if is_collision else new_confidence,
        "emotional_intensity": profile.emotional_intensity,
    }
    state["graph_nodes"].append(node)
    
    edge_type = "challenge" if is_collision else "flow"
    edge = {
        "id": f"edge-{node_id_num}",
        "source": prev_node_id,
        "target": current_node_id,
        "animated": True,
        "label": "analysis",
        "edge_type": edge_type,
        "strength": new_confidence,
        "is_collision": is_collision,
    }
    state["graph_edges"].append(edge)
    
    # ── Branch nodes for collisions ─────────────────────────
    if is_collision and collision_data:
        branch_id = f"node-{node_id_num}-collision"
        state["graph_nodes"].append({
            "id": branch_id,
            "type": "collision",
            "label": f"⚡ {collision_data['collision_type'].replace('_', ' ').upper()}",
            "agent": agent_role,
            "agent_name": profile.name,
            "confidence": 1.0 - collision_data["severity"],
            "color": "#EF4444",
            "importance": collision_data["severity"],
            "is_contradiction": True,
            "pulse_intensity": collision_data["severity"],
            "emotional_intensity": 1.0,
        })
        state["graph_edges"].append({
            "id": f"edge-{node_id_num}-collision",
            "source": current_node_id,
            "target": branch_id,
            "animated": True,
            "label": "DISPUTES",
            "edge_type": "collision",
            "strength": collision_data["severity"],
            "is_collision": True,
        })
    
    duration = int((time.time() - start_time) * 1000)
    
    step = {
        "agent": agent_role,
        "agent_name": profile.name,
        "thought": full_response,
        "reasoning_type": "analysis",
        "confidence": new_confidence,
        "is_contradiction": is_collision,
        "is_correction": False,
        "duration_ms": duration,
        "emotional_intensity": profile.emotional_intensity,
        "thinking_speed": profile.thinking_speed,
        "has_collision": is_collision,
        "collision_severity": collision_severity,
    }
    state["steps"].append(step)
    
    # 6. Emit step completion
    await emit(state, "agent_step", {
        "type": "agent_step",
        "agent": agent_role,
        "agent_name": profile.name,
        "agent_color": profile.color,
        "agent_icon": profile.icon,
        "step": step,
        "graph_node": node,
        "graph_edge": edge,
        "overall_confidence": new_confidence,
        "confidence_delta": new_confidence - old_confidence,
        "confidence_history": state["confidence_history"],
    })
    
    if abs(new_confidence - old_confidence) > 0.03:
        await emit(state, "confidence_shift", {
            "type": "confidence_shift",
            "agent": agent_role,
            "from": old_confidence,
            "to": new_confidence,
            "delta": new_confidence - old_confidence,
            "direction": "up" if new_confidence > old_confidence else "down",
        })
        
    state["messages"].append(SystemMessage(content=f"Agent {profile.name} responded: {full_response}"))
    return state

# ─── Node Functions ─────────────────────────────────────────────────────────

async def node_strategic_planner(state: GraphReasoningState):
    return await execute_agent_node(state, "strategic_planner", AGENT_PROFILES["strategic_planner"], "Provide high-level strategic decomposition.")

async def node_researcher(state: GraphReasoningState):
    return await execute_agent_node(state, "researcher", AGENT_PROFILES["researcher"], "Provide evidence and empirical data synthesis.")

async def node_critic(state: GraphReasoningState):
    return await execute_agent_node(state, "critic", AGENT_PROFILES["critic"], "Aggressively challenge assumptions and find logical flaws.")

async def node_verifier(state: GraphReasoningState):
    return await execute_agent_node(state, "verifier", AGENT_PROFILES["verifier"], "Cross-check facts and validate logic chains independently.")

async def node_risk_analyst(state: GraphReasoningState):
    return await execute_agent_node(state, "risk_analyst", AGENT_PROFILES["risk_analyst"], "Identify catastrophic failure modes and worst-case scenarios.")

async def node_optimizer(state: GraphReasoningState):
    return await execute_agent_node(state, "optimizer", AGENT_PROFILES["optimizer"], "Refine strategies for maximum impact and elegance.")

async def node_decider(state: GraphReasoningState):
    state = await execute_agent_node(state, "decider", AGENT_PROFILES["decider"], "Synthesize all inputs into a final, authoritative recommendation.")
    state["final_output"] = state["steps"][-1]["thought"]
    return state

# ─── Router & Graph Builder ─────────────────────────────────────────────────

def build_graph(scenario_mode: str) -> StateGraph:
    workflow = StateGraph(GraphReasoningState)
    
    workflow.add_node("strategic_planner", node_strategic_planner)
    workflow.add_node("researcher", node_researcher)
    workflow.add_node("critic", node_critic)
    workflow.add_node("verifier", node_verifier)
    workflow.add_node("risk_analyst", node_risk_analyst)
    workflow.add_node("optimizer", node_optimizer)
    workflow.add_node("decider", node_decider)
    
    # Conditional logic based on collisions could go here, but for now we enforce a linear/semi-linear flow
    # that still generates deep internal turbulence.
    
    if scenario_mode == "ai_debate_arena":
        # Chaotic debate topology
        workflow.add_edge("verifier", "critic")
        workflow.add_edge("critic", "researcher")
        workflow.add_edge("researcher", "risk_analyst")
        workflow.add_edge("risk_analyst", "optimizer")
        workflow.add_edge("optimizer", "decider")
        workflow.set_entry_point("verifier")
    else:
        # Standard topology
        workflow.add_edge("strategic_planner", "researcher")
        workflow.add_edge("researcher", "critic")
        workflow.add_edge("critic", "verifier")
        workflow.add_edge("verifier", "risk_analyst")
        workflow.add_edge("risk_analyst", "optimizer")
        workflow.add_edge("optimizer", "decider")
        workflow.set_entry_point("strategic_planner")
        
    workflow.add_edge("decider", END)
    
    return workflow.compile()

class LangGraphReasoningEngine:
    def __init__(self, ws_callback=None):
        self.ws_callback = ws_callback

    async def run_reasoning(self, session_id: str, query: str, scenario_mode: str = "business_strategy") -> dict:
        state: GraphReasoningState = {
            "query": query,
            "scenario_mode": scenario_mode,
            "session_id": session_id,
            "current_agent": "strategic_planner",
            "steps": [],
            "interactions": [],
            "graph_nodes": [],
            "graph_edges": [],
            "confidence": 0.0,
            "confidence_history": [],
            "contradictions": [],
            "thought_collisions": [],
            "final_output": None,
            "iteration": 0,
            "max_iterations": 6 if scenario_mode == "ai_debate_arena" else 7,
            "messages": [],
            "ws_callback": self.ws_callback,
            "next_node": ""
        }
        
        # Emit session initialization
        if self.ws_callback:
            await self.ws_callback(session_id, {
                "type": "session_init",
                "query": query,
                "scenario_mode": scenario_mode,
                "agents_count": 8,
                "estimated_steps": state["max_iterations"],
            })
            
        await asyncio.sleep(0.6)
        
        # Root query node
        state["graph_nodes"].append({
            "id": "node-0",
            "type": "query",
            "label": query[:100],
            "agent": None,
            "agent_name": None,
            "confidence": None,
            "color": "#00E5FF",
            "importance": 1.0,
            "is_contradiction": False,
            "pulse_intensity": 0.5,
        })
        
        graph = build_graph(scenario_mode)
        
        # Run graph
        final_state = await graph.ainvoke(state)
        
        # Emit reasoning complete
        if self.ws_callback:
            await self.ws_callback(session_id, {
                "type": "reasoning_complete",
                "final_output": final_state["final_output"],
                "confidence": final_state["confidence"],
                "total_steps": len(final_state["steps"]),
                "contradictions_found": len(final_state["contradictions"]),
                "thought_collisions": len(final_state["thought_collisions"]),
                "graph_nodes": final_state["graph_nodes"],
                "graph_edges": final_state["graph_edges"],
                "confidence_history": final_state["confidence_history"],
            })
            
        return final_state
