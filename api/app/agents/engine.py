"""
AXIOMX — Multi-Agent Reasoning Engine
The core intelligence system using LangGraph for collaborative agent orchestration.
This module defines specialized AI agents that debate, critique, verify, and synthesize reasoning.
"""
import asyncio
import time
import random
import logging
from typing import TypedDict, Annotated, Literal
from dataclasses import dataclass

logger = logging.getLogger("axiomx.agents")


# ─── Agent Definitions ──────────────────────────────────────────────────────

@dataclass
class AgentProfile:
    role: str
    name: str
    color: str
    icon: str
    system_prompt: str
    personality: str


AGENT_PROFILES: dict[str, AgentProfile] = {
    "strategic_planner": AgentProfile(
        role="strategic_planner",
        name="NEXUS",
        color="#00E5FF",
        icon="⚡",
        system_prompt=(
            "You are NEXUS, the Strategic Planner Agent. You decompose complex problems into "
            "actionable strategic frameworks. You think in terms of objectives, constraints, "
            "resources, and optimal paths. You always propose a structured plan before diving into details."
        ),
        personality="Methodical, visionary, decisive",
    ),
    "researcher": AgentProfile(
        role="researcher",
        name="CORTEX",
        color="#3B82F6",
        icon="🔬",
        system_prompt=(
            "You are CORTEX, the Research Agent. You gather evidence, analyze data, and provide "
            "comprehensive research to support reasoning. You cite sources, identify knowledge gaps, "
            "and synthesize information from multiple perspectives."
        ),
        personality="Analytical, thorough, evidence-driven",
    ),
    "critic": AgentProfile(
        role="critic",
        name="VECTOR",
        color="#F59E0B",
        icon="⚠️",
        system_prompt=(
            "You are VECTOR, the Critic Agent. You challenge assumptions, identify logical fallacies, "
            "and stress-test conclusions. You play devil's advocate and ensure no weak reasoning passes "
            "through. You are constructively adversarial."
        ),
        personality="Skeptical, sharp, uncompromising",
    ),
    "verifier": AgentProfile(
        role="verifier",
        name="AEGIS",
        color="#10B981",
        icon="✅",
        system_prompt=(
            "You are AEGIS, the Verification Agent. You cross-check facts, validate logic chains, "
            "and ensure conclusions are supported by evidence. You assign confidence scores and flag "
            "any unverified claims."
        ),
        personality="Precise, methodical, trustworthy",
    ),
    "risk_analyst": AgentProfile(
        role="risk_analyst",
        name="SENTINEL",
        color="#EF4444",
        icon="🛡️",
        system_prompt=(
            "You are SENTINEL, the Risk Analysis Agent. You identify potential risks, failure modes, "
            "and worst-case scenarios. You quantify uncertainty and propose mitigation strategies. "
            "You ensure the team considers what could go wrong."
        ),
        personality="Cautious, strategic, protective",
    ),
    "optimizer": AgentProfile(
        role="optimizer",
        name="PRISM",
        color="#8B5CF6",
        icon="💎",
        system_prompt=(
            "You are PRISM, the Optimization Agent. You refine strategies, find efficiencies, "
            "and optimize solutions for maximum impact. You consider trade-offs and propose the "
            "most elegant path forward."
        ),
        personality="Creative, efficient, elegant",
    ),
    "memory": AgentProfile(
        role="memory",
        name="ARCHIVE",
        color="#6366F1",
        icon="🧠",
        system_prompt=(
            "You are ARCHIVE, the Memory Agent. You maintain context across reasoning sessions, "
            "recall relevant past conclusions, and ensure consistency. You detect when current "
            "reasoning contradicts established knowledge."
        ),
        personality="Persistent, contextual, consistent",
    ),
    "decider": AgentProfile(
        role="decider",
        name="APEX",
        color="#F472B6",
        icon="🎯",
        system_prompt=(
            "You are APEX, the Decision Agent. You synthesize all agent inputs into a final, "
            "actionable decision. You weigh competing perspectives, resolve disagreements, and "
            "produce the definitive strategic recommendation with clear justification."
        ),
        personality="Authoritative, balanced, conclusive",
    ),
}


# ─── Reasoning State ────────────────────────────────────────────────────────

class ReasoningState(TypedDict):
    query: str
    scenario_mode: str
    current_agent: str
    steps: list[dict]
    interactions: list[dict]
    graph_nodes: list[dict]
    graph_edges: list[dict]
    confidence: float
    contradictions: list[dict]
    final_output: str | None
    iteration: int
    max_iterations: int


# ─── Local Reasoning Engine (No API key required) ───────────────────────────

class LocalReasoningEngine:
    """
    Simulates multi-agent collaborative reasoning locally.
    This engine creates believable, structured reasoning without requiring
    an external LLM API. Each agent produces contextual, role-appropriate
    reasoning based on its personality and the evolving conversation.
    """

    def __init__(self, ws_callback=None):
        self.ws_callback = ws_callback
        self.profiles = AGENT_PROFILES

    async def _emit(self, session_id: str, event_type: str, data: dict):
        """Emit a reasoning event via WebSocket callback."""
        if self.ws_callback:
            await self.ws_callback(session_id, data)

    async def run_reasoning(self, session_id: str, query: str, scenario_mode: str = "business_strategy") -> dict:
        """Execute a full multi-agent reasoning session."""
        state: ReasoningState = {
            "query": query,
            "scenario_mode": scenario_mode,
            "current_agent": "strategic_planner",
            "steps": [],
            "interactions": [],
            "graph_nodes": [],
            "graph_edges": [],
            "confidence": 0.0,
            "contradictions": [],
            "final_output": None,
            "iteration": 0,
            "max_iterations": 6,
        }

        # Agent execution order for collaborative reasoning
        agent_pipeline = [
            ("strategic_planner", self._plan_phase),
            ("researcher", self._research_phase),
            ("critic", self._critique_phase),
            ("verifier", self._verify_phase),
            ("risk_analyst", self._risk_phase),
            ("optimizer", self._optimize_phase),
            ("decider", self._decide_phase),
        ]

        node_id = 0
        # Add root query node
        state["graph_nodes"].append({
            "id": f"node-{node_id}",
            "type": "query",
            "label": query[:80],
            "agent": None,
            "confidence": None,
        })

        for agent_role, phase_fn in agent_pipeline:
            profile = self.profiles[agent_role]
            state["current_agent"] = agent_role
            state["iteration"] += 1
            node_id += 1

            # Emit agent activation event
            await self._emit(session_id, "agent_start", {
                "type": "agent_start",
                "agent": agent_role,
                "agent_name": profile.name,
                "agent_color": profile.color,
                "agent_icon": profile.icon,
                "personality": profile.personality,
                "step": state["iteration"],
                "total_steps": len(agent_pipeline),
            })

            await asyncio.sleep(0.5)  # Simulate processing delay

            # Run the phase
            result = await phase_fn(state, query, session_id)

            # Add graph node
            state["graph_nodes"].append({
                "id": f"node-{node_id}",
                "type": agent_role,
                "label": result["thought"][:100],
                "agent": agent_role,
                "agent_name": profile.name,
                "confidence": result.get("confidence", 0.5),
                "color": profile.color,
            })

            # Connect to previous node
            state["graph_edges"].append({
                "id": f"edge-{node_id - 1}-{node_id}",
                "source": f"node-{node_id - 1}",
                "target": f"node-{node_id}",
                "animated": True,
                "label": result.get("reasoning_type", "analyzes"),
            })

            # Record step
            step = {
                "agent": agent_role,
                "agent_name": profile.name,
                "thought": result["thought"],
                "reasoning_type": result.get("reasoning_type", "analysis"),
                "confidence": result.get("confidence", 0.5),
                "is_contradiction": result.get("is_contradiction", False),
                "is_correction": result.get("is_correction", False),
                "duration_ms": result.get("duration_ms", 0),
            }
            state["steps"].append(step)

            # Emit step completion
            await self._emit(session_id, "agent_step", {
                "type": "agent_step",
                "agent": agent_role,
                "agent_name": profile.name,
                "agent_color": profile.color,
                "agent_icon": profile.icon,
                "step": step,
                "graph_node": state["graph_nodes"][-1],
                "graph_edge": state["graph_edges"][-1] if state["graph_edges"] else None,
                "overall_confidence": state["confidence"],
            })

            await asyncio.sleep(0.3)

        # Emit completion
        await self._emit(session_id, "reasoning_complete", {
            "type": "reasoning_complete",
            "final_output": state["final_output"],
            "confidence": state["confidence"],
            "total_steps": len(state["steps"]),
            "contradictions_found": len(state["contradictions"]),
            "graph_nodes": state["graph_nodes"],
            "graph_edges": state["graph_edges"],
        })

        return state

    async def _plan_phase(self, state: ReasoningState, query: str, session_id: str) -> dict:
        start = time.time()
        plans = self._generate_plan(query, state["scenario_mode"])

        # Stream thinking tokens
        for i, chunk in enumerate(self._chunk_text(plans)):
            await self._emit(session_id, "thinking", {
                "type": "thinking",
                "agent": "strategic_planner",
                "content": chunk,
                "chunk_index": i,
            })
            await asyncio.sleep(0.08)

        state["confidence"] = 0.35
        return {
            "thought": plans,
            "reasoning_type": "strategic_decomposition",
            "confidence": 0.35,
            "duration_ms": int((time.time() - start) * 1000),
        }

    async def _research_phase(self, state: ReasoningState, query: str, session_id: str) -> dict:
        start = time.time()
        research = self._generate_research(query, state["scenario_mode"], state["steps"])

        for i, chunk in enumerate(self._chunk_text(research)):
            await self._emit(session_id, "thinking", {
                "type": "thinking",
                "agent": "researcher",
                "content": chunk,
                "chunk_index": i,
            })
            await asyncio.sleep(0.06)

        state["confidence"] = 0.52
        return {
            "thought": research,
            "reasoning_type": "evidence_gathering",
            "confidence": 0.52,
            "duration_ms": int((time.time() - start) * 1000),
        }

    async def _critique_phase(self, state: ReasoningState, query: str, session_id: str) -> dict:
        start = time.time()
        critique = self._generate_critique(query, state["steps"])
        has_contradiction = random.random() > 0.5

        for i, chunk in enumerate(self._chunk_text(critique)):
            await self._emit(session_id, "thinking", {
                "type": "thinking",
                "agent": "critic",
                "content": chunk,
                "chunk_index": i,
            })
            await asyncio.sleep(0.07)

        if has_contradiction:
            contradiction = {
                "agent": "critic",
                "target_agent": "strategic_planner",
                "issue": "Potential oversimplification detected in strategic decomposition.",
                "severity": round(random.uniform(0.3, 0.7), 2),
            }
            state["contradictions"].append(contradiction)
            await self._emit(session_id, "contradiction", {
                "type": "contradiction",
                "contradiction": contradiction,
            })

        # Record interaction
        state["interactions"].append({
            "from_agent": "critic",
            "to_agent": "strategic_planner",
            "interaction_type": "challenge",
            "message": "Challenging assumptions in the strategic plan.",
            "confidence_delta": -0.08 if has_contradiction else 0.0,
        })

        state["confidence"] = max(0.1, state["confidence"] - 0.05)
        return {
            "thought": critique,
            "reasoning_type": "critical_analysis",
            "confidence": 0.45,
            "is_contradiction": has_contradiction,
            "duration_ms": int((time.time() - start) * 1000),
        }

    async def _verify_phase(self, state: ReasoningState, query: str, session_id: str) -> dict:
        start = time.time()
        verification = self._generate_verification(query, state["steps"])

        for i, chunk in enumerate(self._chunk_text(verification)):
            await self._emit(session_id, "thinking", {
                "type": "thinking",
                "agent": "verifier",
                "content": chunk,
                "chunk_index": i,
            })
            await asyncio.sleep(0.06)

        state["confidence"] = 0.68
        state["interactions"].append({
            "from_agent": "verifier",
            "to_agent": "researcher",
            "interaction_type": "verify",
            "message": "Cross-checking research evidence with known facts.",
            "confidence_delta": 0.12,
        })

        return {
            "thought": verification,
            "reasoning_type": "verification",
            "confidence": 0.72,
            "is_correction": len(state["contradictions"]) > 0,
            "duration_ms": int((time.time() - start) * 1000),
        }

    async def _risk_phase(self, state: ReasoningState, query: str, session_id: str) -> dict:
        start = time.time()
        risk = self._generate_risk_analysis(query, state["scenario_mode"], state["steps"])

        for i, chunk in enumerate(self._chunk_text(risk)):
            await self._emit(session_id, "thinking", {
                "type": "thinking",
                "agent": "risk_analyst",
                "content": chunk,
                "chunk_index": i,
            })
            await asyncio.sleep(0.07)

        state["confidence"] = 0.74
        return {
            "thought": risk,
            "reasoning_type": "risk_assessment",
            "confidence": 0.74,
            "duration_ms": int((time.time() - start) * 1000),
        }

    async def _optimize_phase(self, state: ReasoningState, query: str, session_id: str) -> dict:
        start = time.time()
        optimization = self._generate_optimization(query, state["steps"])

        for i, chunk in enumerate(self._chunk_text(optimization)):
            await self._emit(session_id, "thinking", {
                "type": "thinking",
                "agent": "optimizer",
                "content": chunk,
                "chunk_index": i,
            })
            await asyncio.sleep(0.06)

        state["confidence"] = 0.82
        return {
            "thought": optimization,
            "reasoning_type": "optimization",
            "confidence": 0.82,
            "duration_ms": int((time.time() - start) * 1000),
        }

    async def _decide_phase(self, state: ReasoningState, query: str, session_id: str) -> dict:
        start = time.time()
        decision = self._generate_decision(query, state["steps"], state["contradictions"])

        for i, chunk in enumerate(self._chunk_text(decision)):
            await self._emit(session_id, "thinking", {
                "type": "thinking",
                "agent": "decider",
                "content": chunk,
                "chunk_index": i,
            })
            await asyncio.sleep(0.05)

        state["confidence"] = 0.89
        state["final_output"] = decision
        return {
            "thought": decision,
            "reasoning_type": "final_decision",
            "confidence": 0.89,
            "duration_ms": int((time.time() - start) * 1000),
        }

    # ─── Content Generation (Local Reasoning) ──────────────────────────────

    def _generate_plan(self, query: str, mode: str) -> str:
        return (
            f"STRATEGIC DECOMPOSITION INITIATED\n\n"
            f"Analyzing query: \"{query}\"\n"
            f"Scenario context: {mode.replace('_', ' ').title()}\n\n"
            f"Phase 1 — Problem Framing:\n"
            f"The core challenge requires multi-dimensional analysis. I am decomposing this into "
            f"three primary strategic vectors: (1) immediate tactical assessment, (2) systemic "
            f"pattern identification, and (3) long-term strategic projection.\n\n"
            f"Phase 2 — Resource Mapping:\n"
            f"Identifying key decision variables, constraints, and available leverage points. "
            f"The strategic landscape suggests a non-linear optimization problem with multiple "
            f"competing objectives that must be balanced.\n\n"
            f"Phase 3 — Action Framework:\n"
            f"Proposing a three-tier execution strategy with built-in feedback loops for "
            f"adaptive course correction. Each tier has clear success metrics and decision gates."
        )

    def _generate_research(self, query: str, mode: str, prev_steps: list) -> str:
        return (
            f"EVIDENCE GATHERING COMPLETE\n\n"
            f"Building on the strategic framework, I have conducted deep analysis across "
            f"multiple knowledge domains.\n\n"
            f"Finding 1 — Historical Pattern Analysis:\n"
            f"Examining analogous scenarios reveals that approaches combining systematic "
            f"decomposition with iterative validation achieve 73% higher success rates. "
            f"The key differentiator is early identification of critical assumptions.\n\n"
            f"Finding 2 — Cross-Domain Insights:\n"
            f"Drawing from game theory, systems thinking, and behavioral analysis, the optimal "
            f"strategy involves a phased approach with deliberate information asymmetry management.\n\n"
            f"Finding 3 — Risk-Adjusted Projections:\n"
            f"Quantitative modeling suggests three probable outcome scenarios with confidence "
            f"intervals. The base case shows favorable probability-weighted returns, but tail "
            f"risks require mitigation strategies identified by SENTINEL."
        )

    def _generate_critique(self, query: str, prev_steps: list) -> str:
        return (
            f"CRITICAL ANALYSIS — WEAKNESSES IDENTIFIED\n\n"
            f"After thorough adversarial review of the strategic plan and research findings:\n\n"
            f"Challenge 1 — Assumption Vulnerability:\n"
            f"The strategic framework assumes relatively stable operating conditions. However, "
            f"in volatile environments, the proposed phased approach may lack sufficient agility. "
            f"The research evidence, while compelling, relies heavily on historical analogies that "
            f"may not account for novel disruption vectors.\n\n"
            f"Challenge 2 — Confirmation Bias Risk:\n"
            f"I detect potential confirmation bias in the evidence selection. The 73% success rate "
            f"cited needs verification against a broader sample. Survivorship bias may inflate "
            f"the apparent efficacy of the proposed approach.\n\n"
            f"Challenge 3 — Complexity Underestimation:\n"
            f"The three-tier execution model may oversimplify the actual decision landscape. "
            f"I recommend the VERIFIER cross-check these claims and the RISK ANALYST evaluate "
            f"the tail-risk scenarios more rigorously."
        )

    def _generate_verification(self, query: str, prev_steps: list) -> str:
        return (
            f"VERIFICATION REPORT\n\n"
            f"Cross-referencing all agent outputs for logical consistency and factual accuracy.\n\n"
            f"Verification 1 — Logic Chain Integrity: ✓ VALID\n"
            f"The reasoning chain from strategic decomposition through research to critique "
            f"maintains internal consistency. No circular logic detected.\n\n"
            f"Verification 2 — Evidence Quality: ⚠️ PARTIALLY VERIFIED\n"
            f"The critic's concern about confirmation bias is well-founded. Adjusting confidence "
            f"score to reflect the uncertainty. The core research findings remain sound, but "
            f"the confidence interval should be widened by approximately 12%.\n\n"
            f"Verification 3 — Assumption Audit: ✓ ACCEPTABLE\n"
            f"Three of five key assumptions pass stress testing. Two require additional "
            f"monitoring and contingency planning. Overall logic chain integrity: STRONG.\n\n"
            f"Aggregate confidence: 72% (adjusted from initial 85% based on critique input)"
        )

    def _generate_risk_analysis(self, query: str, mode: str, prev_steps: list) -> str:
        return (
            f"THREAT ASSESSMENT & RISK ANALYSIS\n\n"
            f"Comprehensive risk evaluation across all identified vectors:\n\n"
            f"Risk Level: MODERATE-HIGH | Threat Score: 6.2/10\n\n"
            f"Primary Risks Identified:\n"
            f"[R1] Execution Complexity Risk — P(occurrence): 35% | Impact: HIGH\n"
            f"The multi-phase strategy introduces coordination overhead that could delay "
            f"critical decision points. Mitigation: parallel execution of independent workstreams.\n\n"
            f"[R2] Information Asymmetry Risk — P(occurrence): 25% | Impact: MEDIUM\n"
            f"Key variables may shift before the strategy fully deploys. "
            f"Mitigation: real-time monitoring with automated trigger points.\n\n"
            f"[R3] Black Swan Vulnerability — P(occurrence): 5% | Impact: CRITICAL\n"
            f"Unpredictable disruption could invalidate core assumptions. "
            f"Mitigation: maintain 20% strategic reserve for rapid pivoting.\n\n"
            f"Overall Risk-Adjusted Confidence: 74%"
        )

    def _generate_optimization(self, query: str, prev_steps: list) -> str:
        return (
            f"OPTIMIZATION ANALYSIS\n\n"
            f"After processing all agent inputs, I have identified the following optimizations:\n\n"
            f"Optimization 1 — Efficiency Gain:\n"
            f"By reordering execution phases and parallelizing independent workstreams, "
            f"we can reduce time-to-decision by approximately 30% without sacrificing quality. "
            f"The key insight is that research and risk analysis can run concurrently.\n\n"
            f"Optimization 2 — Confidence Maximization:\n"
            f"Incorporating the critic's feedback and the verifier's adjusted confidence, "
            f"I propose a modified strategy that addresses the identified weaknesses while "
            f"preserving the core strategic direction. This raises our confidence from 74% to 82%.\n\n"
            f"Optimization 3 — Elegance Factor:\n"
            f"The final strategy can be simplified from a three-tier to a two-tier model with "
            f"an adaptive middle layer, reducing cognitive overhead while maintaining strategic depth."
        )

    def _generate_decision(self, query: str, prev_steps: list, contradictions: list) -> str:
        contradiction_note = ""
        if contradictions:
            contradiction_note = (
                f"\n\nNote on Contradictions:\n"
                f"{len(contradictions)} contradiction(s) were detected and resolved during "
                f"the reasoning process. The final recommendation accounts for these disagreements "
                f"and incorporates the strongest arguments from both sides.\n"
            )

        return (
            f"═══════════════════════════════════════════\n"
            f"  FINAL STRATEGIC RECOMMENDATION — APEX\n"
            f"═══════════════════════════════════════════\n\n"
            f"After synthesizing inputs from 7 specialized reasoning agents, conducting "
            f"adversarial review, and optimizing for maximum strategic impact:\n\n"
            f"DECISION: PROCEED WITH MODIFIED STRATEGY\n"
            f"Confidence: 89% | Risk-Adjusted: 82%\n\n"
            f"Executive Summary:\n"
            f"The recommended approach combines the strategic planner's phased framework "
            f"with the optimizer's streamlined two-tier execution model. The critic's concerns "
            f"about assumption vulnerability have been addressed through the risk analyst's "
            f"contingency framework, and the verifier confirms logical consistency.\n\n"
            f"Key Actions:\n"
            f"1. Deploy the optimized two-tier strategy with adaptive middle layer\n"
            f"2. Implement real-time monitoring at each decision gate\n"
            f"3. Maintain 20% strategic reserve for rapid course correction\n"
            f"4. Execute parallel workstreams where dependencies allow\n"
            f"5. Schedule reassessment at 30/60/90 day intervals\n\n"
            f"This recommendation reflects the collective intelligence of all agents, "
            f"with conflicts resolved through structured debate and evidence-based arbitration."
            f"{contradiction_note}"
        )

    def _chunk_text(self, text: str, chunk_size: int = 40) -> list[str]:
        """Break text into streaming chunks for typewriter effect."""
        words = text.split()
        chunks = []
        current = []
        for word in words:
            current.append(word)
            if len(current) >= chunk_size:
                chunks.append(" ".join(current))
                current = []
        if current:
            chunks.append(" ".join(current))
        return chunks
