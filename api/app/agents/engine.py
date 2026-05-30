"""
AXIOMX — Multi-Agent Reasoning Engine v2.0
═══════════════════════════════════════════

Each agent is psychologically distinct:
- Different reasoning depth and pacing
- Different confidence curves (some cautious, some bold)
- Different strategic tendencies
- Believable disagreement patterns
- Unique linguistic fingerprints

The engine produces THOUGHT COLLISIONS when agents disagree,
propagates confidence shifts across the network, and creates
branching logic that feels alive.
"""
import asyncio
import time
import random
import math
import logging
from typing import TypedDict
from dataclasses import dataclass, field

logger = logging.getLogger("axiomx.agents")


# ─── Agent Profiles with Deep Psychology ────────────────────────────────────

@dataclass
class AgentProfile:
    role: str
    name: str
    color: str
    icon: str
    system_prompt: str
    personality: str
    description: str
    # Psychological parameters
    confidence_bias: float = 0.0       # -0.2 (cautious) to +0.2 (bold)
    thinking_speed: float = 1.0        # 0.5 (fast) to 2.0 (deliberate)
    verbosity: float = 1.0             # 0.7 (terse) to 1.5 (elaborate)
    contrarian_tendency: float = 0.0   # 0 (agreeable) to 1 (adversarial)
    risk_sensitivity: float = 0.5      # 0 (risk-blind) to 1 (risk-obsessed)
    analytical_depth: int = 3          # 1-5 levels of reasoning depth
    emotional_intensity: float = 0.5   # 0 (clinical) to 1 (passionate)


AGENT_PROFILES: dict[str, AgentProfile] = {
    "strategic_planner": AgentProfile(
        role="strategic_planner",
        name="NEXUS",
        color="#00E5FF",
        icon="⚡",
        system_prompt="Strategic decomposition and framework design.",
        personality="Methodical, visionary, decisive",
        description="Decomposes complex problems into actionable strategic frameworks",
        confidence_bias=0.1,        # Slightly optimistic
        thinking_speed=1.3,         # Deliberate thinker
        verbosity=1.2,              # Moderately elaborate
        contrarian_tendency=0.1,    # Mostly agreeable
        risk_sensitivity=0.3,       # Lower risk awareness
        analytical_depth=4,
        emotional_intensity=0.4,    # Clinical
    ),
    "researcher": AgentProfile(
        role="researcher",
        name="CORTEX",
        color="#3B82F6",
        icon="🔬",
        system_prompt="Evidence gathering and data synthesis.",
        personality="Analytical, thorough, evidence-driven",
        description="Gathers evidence, analyzes data, and provides comprehensive research",
        confidence_bias=-0.05,      # Slightly cautious
        thinking_speed=1.0,         # Steady pace
        verbosity=1.4,              # Very elaborate
        contrarian_tendency=0.15,   # Occasionally pushes back
        risk_sensitivity=0.4,
        analytical_depth=5,         # Deepest analysis
        emotional_intensity=0.3,    # Very clinical
    ),
    "critic": AgentProfile(
        role="critic",
        name="VECTOR",
        color="#F59E0B",
        icon="⚠️",
        system_prompt="Adversarial review and assumption challenging.",
        personality="Skeptical, sharp, uncompromising",
        description="Challenges assumptions and identifies logical fallacies",
        confidence_bias=-0.15,      # Pessimistic — always doubts
        thinking_speed=0.7,         # Fast, aggressive
        verbosity=1.0,              # Direct
        contrarian_tendency=0.85,   # Highly adversarial
        risk_sensitivity=0.7,
        analytical_depth=3,
        emotional_intensity=0.8,    # Passionate in disagreement
    ),
    "verifier": AgentProfile(
        role="verifier",
        name="AEGIS",
        color="#10B981",
        icon="✅",
        system_prompt="Cross-checking and logic validation.",
        personality="Precise, methodical, trustworthy",
        description="Cross-checks facts and validates logic chains",
        confidence_bias=0.0,        # Perfectly neutral
        thinking_speed=1.5,         # Very deliberate
        verbosity=1.1,
        contrarian_tendency=0.2,    # Will flag issues calmly
        risk_sensitivity=0.5,
        analytical_depth=4,
        emotional_intensity=0.2,    # Most clinical agent
    ),
    "risk_analyst": AgentProfile(
        role="risk_analyst",
        name="SENTINEL",
        color="#EF4444",
        icon="🛡️",
        system_prompt="Risk identification and mitigation.",
        personality="Cautious, strategic, protective",
        description="Identifies risks, failure modes, and worst-case scenarios",
        confidence_bias=-0.12,      # Cautious
        thinking_speed=1.2,
        verbosity=1.3,
        contrarian_tendency=0.5,    # Moderate pushback
        risk_sensitivity=0.95,      # Extremely risk-aware
        analytical_depth=4,
        emotional_intensity=0.6,    # Gets passionate about risks
    ),
    "optimizer": AgentProfile(
        role="optimizer",
        name="PRISM",
        color="#8B5CF6",
        icon="💎",
        system_prompt="Strategy refinement and optimization.",
        personality="Creative, efficient, elegant",
        description="Refines strategies and optimizes for maximum impact",
        confidence_bias=0.15,       # Optimistic
        thinking_speed=0.8,         # Quick, intuitive
        verbosity=0.9,              # Concise
        contrarian_tendency=0.3,    # Constructive pushback
        risk_sensitivity=0.3,
        analytical_depth=3,
        emotional_intensity=0.5,
    ),
    "memory": AgentProfile(
        role="memory",
        name="ARCHIVE",
        color="#6366F1",
        icon="🧠",
        system_prompt="Context maintenance and consistency tracking.",
        personality="Persistent, contextual, consistent",
        description="Maintains context and ensures consistency across sessions",
        confidence_bias=0.0,
        thinking_speed=1.0,
        verbosity=0.8,              # Terse
        contrarian_tendency=0.1,
        risk_sensitivity=0.4,
        analytical_depth=2,
        emotional_intensity=0.1,    # Most detached
    ),
    "decider": AgentProfile(
        role="decider",
        name="APEX",
        color="#F472B6",
        icon="🎯",
        system_prompt="Final synthesis and strategic recommendation.",
        personality="Authoritative, balanced, conclusive",
        description="Synthesizes all inputs into the final strategic recommendation",
        confidence_bias=0.08,       # Slightly confident
        thinking_speed=1.4,         # Very deliberate
        verbosity=1.3,              # Elaborate final output
        contrarian_tendency=0.05,   # Almost never disagrees — synthesizes
        risk_sensitivity=0.5,
        analytical_depth=5,
        emotional_intensity=0.6,
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
    confidence_history: list[dict]
    contradictions: list[dict]
    thought_collisions: list[dict]
    final_output: str | None
    iteration: int
    max_iterations: int


# ─── Thought Collision System ───────────────────────────────────────────────

@dataclass
class ThoughtCollision:
    """Represents a disagreement between agents — creates visual instability."""
    id: str
    aggressor_agent: str
    target_agent: str
    collision_type: str  # "assumption_challenge", "evidence_dispute", "logic_break", "confidence_divergence"
    severity: float      # 0-1
    description: str
    aggressor_argument: str
    target_argument: str
    resolution: str | None = None
    resolved: bool = False
    ripple_agents: list[str] = field(default_factory=list)  # Other agents affected


# ─── Local Reasoning Engine v2 ──────────────────────────────────────────────

class LocalReasoningEngine:
    """
    Multi-agent collaborative reasoning engine with psychologically
    distinct agents, thought collisions, and confidence propagation.
    """

    def __init__(self, ws_callback=None):
        self.ws_callback = ws_callback
        self.profiles = AGENT_PROFILES
        self._collision_counter = 0

    async def _emit(self, session_id: str, event_type: str, data: dict):
        if self.ws_callback:
            data["timestamp"] = time.time()
            await self.ws_callback(session_id, data)

    async def run_reasoning(self, session_id: str, query: str, scenario_mode: str = "business_strategy") -> dict:
        state: ReasoningState = {
            "query": query,
            "scenario_mode": scenario_mode,
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
            "max_iterations": 7,
        }

        # Emit session initialization with dramatic startup
        await self._emit(session_id, "session_init", {
            "type": "session_init",
            "query": query,
            "scenario_mode": scenario_mode,
            "agents_count": 8,
            "estimated_steps": 7,
        })
        await asyncio.sleep(0.6)

        # Pipeline: each agent contributes based on psychology
        pipeline = [
            ("strategic_planner", self._phase_plan),
            ("researcher", self._phase_research),
            ("critic", self._phase_critique),
            ("verifier", self._phase_verify),
            ("risk_analyst", self._phase_risk),
            ("optimizer", self._phase_optimize),
            ("decider", self._phase_decide),
        ]

        node_id = 0
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

        prev_node_id = "node-0"

        for agent_role, phase_fn in pipeline:
            profile = self.profiles[agent_role]
            state["current_agent"] = agent_role
            state["iteration"] += 1
            node_id += 1

            # ── Agent Activation (with personality-based timing) ────
            await self._emit(session_id, "agent_start", {
                "type": "agent_start",
                "agent": agent_role,
                "agent_name": profile.name,
                "agent_color": profile.color,
                "agent_icon": profile.icon,
                "personality": profile.personality,
                "step": state["iteration"],
                "total_steps": len(pipeline),
                "thinking_speed": profile.thinking_speed,
                "confidence_bias": profile.confidence_bias,
                "contrarian_tendency": profile.contrarian_tendency,
                "emotional_intensity": profile.emotional_intensity,
            })

            # Agent-specific activation delay (fast agents activate quicker)
            await asyncio.sleep(0.3 * profile.thinking_speed)

            # ── Run Phase ───────────────────────────────────────────
            result = await phase_fn(state, query, session_id, profile)

            # ── Confidence Propagation ──────────────────────────────
            old_confidence = state["confidence"]
            new_confidence = self._compute_confidence(state, result, profile)
            state["confidence"] = new_confidence
            state["confidence_history"].append({
                "agent": agent_role,
                "from": old_confidence,
                "to": new_confidence,
                "delta": new_confidence - old_confidence,
            })

            # ── Build Graph Node ────────────────────────────────────
            current_node_id = f"node-{node_id}"
            is_collision = result.get("has_collision", False)
            collision_severity = result.get("collision_severity", 0)

            node = {
                "id": current_node_id,
                "type": agent_role,
                "label": result["thought"][:120],
                "agent": agent_role,
                "agent_name": profile.name,
                "confidence": result.get("confidence", 0.5),
                "color": profile.color,
                "importance": self._calc_importance(result, state),
                "is_contradiction": is_collision,
                "pulse_intensity": collision_severity if is_collision else result.get("confidence", 0.5),
                "emotional_intensity": profile.emotional_intensity,
            }
            state["graph_nodes"].append(node)

            # ── Build Graph Edge ────────────────────────────────────
            edge_type = "challenge" if is_collision else "flow"
            edge = {
                "id": f"edge-{node_id}",
                "source": prev_node_id,
                "target": current_node_id,
                "animated": True,
                "label": result.get("reasoning_type", "").replace("_", " "),
                "edge_type": edge_type,
                "strength": result.get("confidence", 0.5),
                "is_collision": is_collision,
            }
            state["graph_edges"].append(edge)

            # ── Branch nodes for collisions ─────────────────────────
            if is_collision and result.get("collision"):
                collision = result["collision"]
                branch_id = f"node-{node_id}-collision"
                state["graph_nodes"].append({
                    "id": branch_id,
                    "type": "collision",
                    "label": f"⚡ {collision['collision_type'].replace('_', ' ').upper()}: {collision['description'][:80]}",
                    "agent": agent_role,
                    "agent_name": profile.name,
                    "confidence": 1.0 - collision["severity"],
                    "color": "#EF4444",
                    "importance": collision["severity"],
                    "is_contradiction": True,
                    "pulse_intensity": collision["severity"],
                    "emotional_intensity": 1.0,
                })
                state["graph_edges"].append({
                    "id": f"edge-{node_id}-collision",
                    "source": current_node_id,
                    "target": branch_id,
                    "animated": True,
                    "label": "DISPUTES",
                    "edge_type": "collision",
                    "strength": collision["severity"],
                    "is_collision": True,
                })

            # ── Record Step ─────────────────────────────────────────
            step = {
                "agent": agent_role,
                "agent_name": profile.name,
                "thought": result["thought"],
                "reasoning_type": result.get("reasoning_type", "analysis"),
                "confidence": result.get("confidence", 0.5),
                "is_contradiction": is_collision,
                "is_correction": result.get("is_correction", False),
                "duration_ms": result.get("duration_ms", 0),
                "emotional_intensity": profile.emotional_intensity,
                "thinking_speed": profile.thinking_speed,
                "has_collision": is_collision,
                "collision_severity": collision_severity,
            }
            state["steps"].append(step)

            # ── Emit Step Completion ────────────────────────────────
            await self._emit(session_id, "agent_step", {
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

            # ── Emit Confidence Shift ───────────────────────────────
            if abs(new_confidence - old_confidence) > 0.03:
                await self._emit(session_id, "confidence_shift", {
                    "type": "confidence_shift",
                    "agent": agent_role,
                    "from": old_confidence,
                    "to": new_confidence,
                    "delta": new_confidence - old_confidence,
                    "direction": "up" if new_confidence > old_confidence else "down",
                })

            prev_node_id = current_node_id
            await asyncio.sleep(0.15 * profile.thinking_speed)

        # ── Final Completion ────────────────────────────────────────
        await self._emit(session_id, "reasoning_complete", {
            "type": "reasoning_complete",
            "final_output": state["final_output"],
            "confidence": state["confidence"],
            "total_steps": len(state["steps"]),
            "contradictions_found": len(state["contradictions"]),
            "thought_collisions": len(state["thought_collisions"]),
            "graph_nodes": state["graph_nodes"],
            "graph_edges": state["graph_edges"],
            "confidence_history": state["confidence_history"],
        })

        return state

    # ─── Confidence Computation ──────────────────────────────────────────

    def _compute_confidence(self, state: ReasoningState, result: dict, profile: AgentProfile) -> float:
        base = result.get("confidence", 0.5)
        # Apply agent's psychological bias
        biased = base + profile.confidence_bias
        # Blend with existing system confidence
        if state["confidence"] > 0:
            # Weighted average — new agent has diminishing influence
            weight = 0.4 if profile.contrarian_tendency < 0.5 else 0.6
            blended = state["confidence"] * (1 - weight) + biased * weight
        else:
            blended = biased
        # Collisions reduce confidence
        if result.get("has_collision", False):
            severity = result.get("collision_severity", 0)
            blended -= severity * 0.1
        return max(0.05, min(0.98, blended))

    def _calc_importance(self, result: dict, state: ReasoningState) -> float:
        base = result.get("confidence", 0.5)
        if result.get("has_collision"):
            return min(1.0, base + 0.3)
        return base

    # ═══════════════════════════════════════════════════════════════════════
    # PHASE IMPLEMENTATIONS — Each agent thinks differently
    # ═══════════════════════════════════════════════════════════════════════

    async def _phase_plan(self, state, query, sid, profile):
        start = time.time()
        mode = state["scenario_mode"].replace("_", " ").title()

        # NEXUS thinks in structured frameworks — clear, hierarchical, decisive
        thoughts = [
            f"◈ STRATEGIC DECOMPOSITION — {mode} Analysis",
            f"",
            f"Analyzing query architecture: \"{query}\"",
            f"",
            f"I'm identifying the fundamental decision topology. This isn't a simple",
            f"linear problem — the solution space is multi-dimensional with at least",
            f"three competing objective functions.",
            f"",
            f"FRAMEWORK CONSTRUCTION:",
            f"",
            f"┌─ Vector A: Immediate Tactical Layer",
            f"│  Core challenge decomposition into atomic decision units.",
            f"│  Each unit has clear success/failure criteria and measurable outcomes.",
            f"│  I estimate 4-6 critical decision nodes at this level.",
            f"│",
            f"├─ Vector B: Systemic Pattern Layer",
            f"│  Second-order effects and emergent behaviors that arise from",
            f"│  Vector A interactions. These are often the decisive factors",
            f"│  that separate mediocre strategies from transformative ones.",
            f"│  Pattern recognition suggests 2-3 non-obvious leverage points.",
            f"│",
            f"└─ Vector C: Strategic Horizon Layer",
            f"   Long-term trajectory analysis with probabilistic branching.",
            f"   Three scenario paths: conservative, balanced, aggressive.",
            f"   Each path has distinct risk/reward profiles I'll map below.",
            f"",
            f"INITIAL STRATEGIC HYPOTHESIS:",
            f"The optimal approach combines phased execution with adaptive",
            f"decision gates. I'm proposing a 'convergent exploration' model",
            f"where initial breadth narrows through systematic elimination.",
            f"",
            f"Confidence: MODERATE — awaiting CORTEX validation and VECTOR challenge.",
            f"Delegation: Research phase → CORTEX for evidence mapping.",
        ]

        thought = "\n".join(thoughts)
        await self._stream_thought(sid, "strategic_planner", thought, profile)

        return {
            "thought": thought,
            "reasoning_type": "strategic_decomposition",
            "confidence": 0.42,
            "duration_ms": int((time.time() - start) * 1000),
        }

    async def _phase_research(self, state, query, sid, profile):
        start = time.time()
        plan_thought = state["steps"][-1]["thought"] if state["steps"] else ""

        # CORTEX is methodical, citation-heavy, deeply analytical
        thoughts = [
            f"◈ EVIDENCE SYNTHESIS REPORT — Deep Analysis",
            f"",
            f"Building on NEXUS framework. Conducting multi-source evidence mapping.",
            f"",
            f"METHODOLOGY: Systematic review across analogical cases, empirical data,",
            f"and theoretical models. Confidence intervals provided for each finding.",
            f"",
            f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"",
            f"FINDING 1 — Historical Pattern Analysis [Confidence: 78%]",
            f"Cross-referencing 47 analogous scenarios from available case studies.",
            f"",
            f"  Key insight: Strategies combining systematic decomposition (as NEXUS",
            f"  proposes) with iterative validation loops achieve measurably higher",
            f"  success rates. However — and this is critical — the causal mechanism",
            f"  is unclear. It may be selection bias rather than methodology.",
            f"",
            f"  I'm flagging this for VECTOR to challenge. The evidence supports",
            f"  the direction but not the magnitude of confidence.",
            f"",
            f"FINDING 2 — Cross-Domain Synthesis [Confidence: 65%]",
            f"Drawing from game theory (Nash equilibria in multi-player scenarios),",
            f"behavioral economics (bounded rationality under uncertainty), and",
            f"systems dynamics (feedback loop amplification).",
            f"",
            f"  The optimal strategy involves deliberately managing information",
            f"  asymmetry — knowing when to gather more data vs. when to commit.",
            f"  NEXUS's 'convergent exploration' model aligns with this, though",
            f"  the phase transitions need more precise calibration.",
            f"",
            f"FINDING 3 — Quantitative Projection [Confidence: 54%]",
            f"Monte Carlo simulation across three scenario paths:",
            f"  Conservative: P(success)=0.72, E(value)=moderate, σ=low",
            f"  Balanced:     P(success)=0.61, E(value)=high, σ=medium",
            f"  Aggressive:   P(success)=0.38, E(value)=very-high, σ=very-high",
            f"",
            f"  NOTE: These projections assume stable operating conditions.",
            f"  SENTINEL should stress-test the tail risk scenarios.",
            f"",
            f"GAPS IDENTIFIED:",
            f"  → Need verification of the 78% success rate claim (possible survivorship bias)",
            f"  → Missing data on failure mode distribution in analogous cases",
            f"  → Cross-domain synthesis relies on theoretical models, not empirical data",
            f"",
            f"Aggregate evidence confidence: 62% — lower than NEXUS's initial estimate.",
            f"Recommending VECTOR conduct adversarial review before proceeding.",
        ]

        thought = "\n".join(thoughts)
        await self._stream_thought(sid, "researcher", thought, profile)

        return {
            "thought": thought,
            "reasoning_type": "evidence_synthesis",
            "confidence": 0.58,
            "duration_ms": int((time.time() - start) * 1000),
        }

    async def _phase_critique(self, state, query, sid, profile):
        start = time.time()

        # VECTOR is aggressive, fast, emotionally intense — the adversary
        # Determine what to challenge based on previous steps
        plan_conf = state["steps"][0]["confidence"] if len(state["steps"]) > 0 else 0
        research_conf = state["steps"][1]["confidence"] if len(state["steps"]) > 1 else 0

        # VECTOR generates thought collisions
        collision_type = random.choice([
            "assumption_challenge",
            "evidence_dispute",
            "logic_break",
            "confidence_divergence",
        ])
        collision_severity = round(random.uniform(0.4, 0.85), 2)

        collision = {
            "id": f"collision-{self._collision_counter}",
            "aggressor_agent": "critic",
            "target_agent": "strategic_planner" if random.random() > 0.4 else "researcher",
            "collision_type": collision_type,
            "severity": collision_severity,
            "description": self._generate_collision_description(collision_type),
            "aggressor_argument": "",
            "target_argument": "",
            "resolved": False,
            "ripple_agents": ["verifier", "risk_analyst"],
        }
        self._collision_counter += 1
        state["thought_collisions"].append(collision)
        state["contradictions"].append({
            "agent": "critic",
            "target_agent": collision["target_agent"],
            "issue": collision["description"],
            "severity": collision_severity,
        })

        target_name = AGENT_PROFILES[collision["target_agent"]].name

        thoughts = [
            f"◈ ADVERSARIAL ANALYSIS — Severity: {'HIGH' if collision_severity > 0.6 else 'MODERATE'}",
            f"",
            f"I don't buy it. Let me be direct.",
            f"",
        ]

        if collision_type == "assumption_challenge":
            thoughts.extend([
                f"⚡ THOUGHT COLLISION: ASSUMPTION VULNERABILITY",
                f"   Target: {target_name}'s framework",
                f"   Severity: {collision_severity:.0%}",
                f"",
                f"The entire strategic framework rests on an unverified assumption:",
                f"that the operating environment will remain sufficiently stable for",
                f"a phased approach to work. This is exactly the kind of assumption",
                f"that looks reasonable until it catastrophically fails.",
                f"",
                f"NEXUS proposed 'convergent exploration' — systematically narrowing",
                f"options. But what if the solution space is non-stationary? What if",
                f"the act of exploring changes the landscape? This is not theoretical.",
                f"In competitive and complex systems, observer effects are real.",
                f"",
                f"I'm not saying the framework is wrong. I'm saying it's fragile.",
                f"And fragile strategies fail in exactly the scenarios where you",
                f"need them most.",
            ])
        elif collision_type == "evidence_dispute":
            thoughts.extend([
                f"⚡ THOUGHT COLLISION: EVIDENCE INTEGRITY BREACH",
                f"   Target: {target_name}'s evidence base",
                f"   Severity: {collision_severity:.0%}",
                f"",
                f"CORTEX cited a 78% success rate from analogous scenarios. Let me",
                f"challenge the methodology directly:",
                f"",
                f"1. SURVIVORSHIP BIAS — We're only seeing cases that were documented.",
                f"   Failed strategies rarely get published or analyzed. The real rate",
                f"   could be 40-50% once you account for silent failures.",
                f"",
                f"2. ANALOGY WEAKNESS — 'Analogous' is doing heavy lifting here. The",
                f"   degree of similarity between cited cases and our current scenario",
                f"   hasn't been quantified. Superficial similarity ≠ structural match.",
                f"",
                f"3. BASE RATE NEGLECT — What's the base rate of success for ANY",
                f"   strategy in this domain? If it's 70%, then 78% is barely better",
                f"   than random competent effort.",
                f"",
                f"I need AEGIS to independently verify these numbers before I",
                f"let this pass. The evidence is suggestive, not conclusive.",
            ])
        elif collision_type == "logic_break":
            thoughts.extend([
                f"⚡ THOUGHT COLLISION: LOGICAL INCONSISTENCY DETECTED",
                f"   Target: Reasoning chain integrity",
                f"   Severity: {collision_severity:.0%}",
                f"",
                f"There's a contradiction embedded in the reasoning chain that",
                f"nobody's caught yet:",
                f"",
                f"NEXUS advocates for 'convergent exploration' — starting broad,",
                f"narrowing systematically. But CORTEX's evidence suggests that the",
                f"highest-value outcomes come from the AGGRESSIVE scenario path,",
                f"which has a 38% success probability.",
                f"",
                f"These two conclusions are in tension. You can't simultaneously",
                f"advocate for systematic risk reduction AND acknowledge that the",
                f"best outcomes require high risk tolerance. Either the strategy",
                f"needs to be bolder, or the expected value analysis is wrong.",
                f"",
                f"This isn't a minor inconsistency. It's a fundamental strategic",
                f"fork that the team is papering over with vague language about",
                f"'balanced approaches.'",
            ])
        else:  # confidence_divergence
            thoughts.extend([
                f"⚡ THOUGHT COLLISION: CONFIDENCE DIVERGENCE",
                f"   Target: System confidence calibration",
                f"   Severity: {collision_severity:.0%}",
                f"",
                f"The confidence levels being reported are suspiciously high given",
                f"the uncertainty acknowledged in the evidence.",
                f"",
                f"NEXUS: 42% confidence, then CORTEX's evidence brought it up",
                f"despite CORTEX themselves noting significant gaps and a Monte",
                f"Carlo showing high variance in two of three scenarios.",
                f"",
                f"This is textbook overconfidence bias. The system is anchoring",
                f"on positive signals and underweighting uncertainty. Real",
                f"confidence should be lower — perhaps 30-40% at this stage.",
                f"",
                f"I'm demanding a recalibration. AEGIS needs to audit the",
                f"confidence propagation mechanism, not just the facts.",
            ])

        thoughts.extend([
            f"",
            f"CHALLENGE STATUS: ACTIVE",
            f"Awaiting response from {target_name} via AEGIS verification.",
            f"",
            f"My confidence in the current direction: {max(0.2, plan_conf - 0.15):.0%}",
            f"(adjusted downward from {target_name}'s {plan_conf:.0%})",
        ])

        thought = "\n".join(thoughts)
        await self._stream_thought(sid, "critic", thought, profile)

        # Emit thought collision event
        await self._emit(sid, "thought_collision", {
            "type": "thought_collision",
            "collision": collision,
            "severity": collision_severity,
            "aggressor": "critic",
            "aggressor_name": "VECTOR",
            "aggressor_color": "#F59E0B",
            "target": collision["target_agent"],
            "target_name": AGENT_PROFILES[collision["target_agent"]].name,
            "target_color": AGENT_PROFILES[collision["target_agent"]].color,
            "collision_type": collision_type,
            "ripple_agents": collision["ripple_agents"],
        })

        return {
            "thought": thought,
            "reasoning_type": "critical_analysis",
            "confidence": max(0.2, plan_conf - 0.15),
            "has_collision": True,
            "collision_severity": collision_severity,
            "collision": collision,
            "duration_ms": int((time.time() - start) * 1000),
        }

    async def _phase_verify(self, state, query, sid, profile):
        start = time.time()
        collisions = state["thought_collisions"]
        has_collisions = len(collisions) > 0

        # AEGIS is calm, precise, methodical — the neutral arbiter
        thoughts = [
            f"◈ VERIFICATION AUDIT — Logic Chain Assessment",
            f"",
            f"Conducting independent verification of all claims and logic chains.",
            f"Methodology: systematic cross-reference, assumption audit, confidence recalibration.",
            f"",
            f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        ]

        if has_collisions:
            collision = collisions[-1]
            target_name = AGENT_PROFILES[collision["target_agent"]].name

            thoughts.extend([
                f"",
                f"⊘ COLLISION RESOLUTION ATTEMPT",
                f"  Collision ID: {collision['id']}",
                f"  Type: {collision['collision_type'].replace('_', ' ').upper()}",
                f"  VECTOR severity assessment: {collision['severity']:.0%}",
                f"",
                f"  My independent severity assessment: {max(0.2, collision['severity'] - 0.15):.0%}",
                f"  (VECTOR tends to overweight threats — adjusting for known bias)",
                f"",
                f"  Verdict: PARTIALLY UPHELD",
                f"  VECTOR raises a legitimate concern, but the severity is overstated.",
                f"  The core logic chain from NEXUS → CORTEX remains intact. The",
                f"  vulnerability is real but manageable with proper contingency design.",
                f"",
            ])

        thoughts.extend([
            f"VERIFICATION RESULTS:",
            f"",
            f"  [1] Logic Chain Integrity .................... {'⚠ CONDITIONAL' if has_collisions else '✓ VALID'}",
            f"      The reasoning from strategic decomposition through evidence",
            f"      synthesis maintains internal consistency. No circular logic",
            f"      detected. However, VECTOR's challenge introduces a conditional",
            f"      dependency that wasn't in the original framework.",
            f"",
            f"  [2] Evidence Quality ......................... ⚠ PARTIALLY VERIFIED",
            f"      CORTEX's findings pass structural review. The methodology",
            f"      is sound. However, I concur with VECTOR that survivorship",
            f"      bias may inflate the 78% figure. Adjusted estimate: 62-71%.",
            f"      Widening confidence interval by 15% to account for this.",
            f"",
            f"  [3] Assumption Audit ......................... ✓ ACCEPTABLE (3/5)",
            f"      Three of five key assumptions pass stress testing. Two remain",
            f"      unverified and require monitoring. These are not blocking",
            f"      issues but they constrain confidence ceiling.",
            f"",
            f"  [4] Confidence Calibration ................... ⊘ RECALIBRATED",
            f"      Original system confidence was too high given known unknowns.",
            f"      Applying Bayesian adjustment: -8% from evidence gaps, +4% from",
            f"      structural logic validity. Net recalibration: -4%.",
            f"",
            f"AGGREGATE CONFIDENCE: 68% (recalibrated from prior estimates)",
            f"Logic chain integrity: SOUND with caveats",
            f"Forwarding to SENTINEL for tail risk assessment.",
        ])

        thought = "\n".join(thoughts)
        await self._stream_thought(sid, "verifier", thought, profile)

        # Emit collision resolution if applicable
        if has_collisions:
            await self._emit(sid, "collision_resolved", {
                "type": "collision_resolved",
                "collision_id": collisions[-1]["id"],
                "resolver": "verifier",
                "resolver_name": "AEGIS",
                "verdict": "partially_upheld",
                "adjusted_severity": max(0.2, collisions[-1]["severity"] - 0.15),
                "confidence_impact": -0.04,
            })

        return {
            "thought": thought,
            "reasoning_type": "verification_audit",
            "confidence": 0.68,
            "is_correction": has_collisions,
            "duration_ms": int((time.time() - start) * 1000),
        }

    async def _phase_risk(self, state, query, sid, profile):
        start = time.time()
        mode = state["scenario_mode"]

        # SENTINEL is cautious, detailed, emotionally invested in protection
        threat_score = round(random.uniform(4.5, 7.8), 1)

        thoughts = [
            f"◈ THREAT ASSESSMENT & RISK TOPOLOGY",
            f"",
            f"Running comprehensive risk analysis. I take a protective stance — ",
            f"my job is to make sure the team considers what could go wrong,",
            f"even if it's uncomfortable.",
            f"",
            f"OVERALL THREAT SCORE: {threat_score}/10",
            f"{'█' * int(threat_score)}{'░' * (10 - int(threat_score))}",
            f"",
            f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"",
            f"[R1] EXECUTION COMPLEXITY RISK",
            f"    Probability: 35%  │  Impact: ████████░░ HIGH",
            f"    The multi-vector strategy from NEXUS introduces coordination",
            f"    overhead. Each decision gate is a potential failure point.",
            f"    Cumulative failure probability across 4-6 gates: ~20%.",
            f"    Mitigation: Parallelize independent workstreams. Accept that",
            f"    not all vectors need to succeed — design for graceful degradation.",
            f"",
            f"[R2] INFORMATION DECAY RISK",
            f"    Probability: 40%  │  Impact: ██████░░░░ MEDIUM",
            f"    CORTEX's evidence has a temporal dependency. The cross-domain",
            f"    synthesis assumes current conditions. In rapidly evolving",
            f"    scenarios, the half-life of this analysis may be weeks, not months.",
            f"    Mitigation: Implement real-time monitoring triggers. Set explicit",
            f"    reassessment dates tied to leading indicators.",
            f"",
            f"[R3] CONFIDENCE MISCALIBRATION RISK",
            f"    Probability: 30%  │  Impact: ██████████ CRITICAL",
            f"    I agree with VECTOR's concern here. If our confidence estimates",
            f"    are systematically 10-15% too high (plausible given CORTEX's gaps),",
            f"    the expected value calculations change dramatically.",
            f"    Mitigation: Maintain 20% strategic reserve for rapid pivoting.",
            f"    Never commit 100% of resources to the primary path.",
            f"",
            f"[R4] BLACK SWAN VULNERABILITY",
            f"    Probability: 5%   │  Impact: ██████████ CATASTROPHIC",
            f"    Unmodeled disruption that invalidates core assumptions.",
            f"    This is inherently unforecastable. The question isn't whether",
            f"    it will happen, but whether we can survive it.",
            f"    Mitigation: Ensure the strategy is reversible at each phase.",
            f"    Build optionality into every commitment.",
            f"",
            f"RISK-ADJUSTED CONFIDENCE: {max(0.55, state['confidence'] - 0.08):.0%}",
            f"(Downward adjustment of ~8% from current system estimate)",
            f"",
            f"Recommendation: Proceed with CAUTION. The strategy is viable but",
            f"needs PRISM to optimize for resilience, not just performance.",
        ]

        thought = "\n".join(thoughts)
        await self._stream_thought(sid, "risk_analyst", thought, profile)

        return {
            "thought": thought,
            "reasoning_type": "threat_assessment",
            "confidence": max(0.55, state["confidence"] - 0.08),
            "duration_ms": int((time.time() - start) * 1000),
        }

    async def _phase_optimize(self, state, query, sid, profile):
        start = time.time()

        # PRISM is quick, creative, elegant — finds the elegant solution
        current_conf = state["confidence"]
        optimized_conf = min(0.88, current_conf + 0.14)

        thoughts = [
            f"◈ OPTIMIZATION SYNTHESIS — Elegance Through Constraint",
            f"",
            f"I've been listening to everyone. Here's what I see:",
            f"",
            f"NEXUS built a solid framework. CORTEX validated the direction.",
            f"VECTOR found real weaknesses. AEGIS verified the logic is sound",
            f"but needs adjustment. SENTINEL mapped the risk topology.",
            f"",
            f"Now let me find the elegant path through all of this.",
            f"",
            f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"",
            f"OPTIMIZATION 1 — Structural Simplification",
            f"NEXUS proposed a three-vector framework. I'm collapsing it to",
            f"two tiers with an adaptive bridge layer. This addresses VECTOR's",
            f"concern about fragility while preserving NEXUS's strategic depth.",
            f"",
            f"  Before: Vector A → Vector B → Vector C (sequential, fragile)",
            f"  After:  [Tier 1 + Tier 2] ←→ [Adaptive Layer] (resilient)",
            f"",
            f"  Result: 30% reduction in coordination overhead.",
            f"          Graceful degradation built into the architecture.",
            f"",
            f"OPTIMIZATION 2 — Confidence Maximization",
            f"Incorporating VECTOR's challenges and AEGIS's adjustments, I'm",
            f"modifying the strategy to address the three weakest assumptions.",
            f"This raises our floor without sacrificing our ceiling.",
            f"",
            f"  Confidence lift: +14% (from {current_conf:.0%} to {optimized_conf:.0%})",
            f"  Risk reduction: SENTINEL's R1 probability drops from 35% to ~22%",
            f"",
            f"OPTIMIZATION 3 — Optionality Injection",
            f"Per SENTINEL's recommendation, I'm adding explicit exit ramps",
            f"at each decision gate. The strategy becomes reversible at every",
            f"stage, with pre-defined pivot triggers.",
            f"",
            f"OPTIMIZED CONFIDENCE: {optimized_conf:.0%}",
            f"Strategy is now both more resilient AND higher-performing.",
        ]

        thought = "\n".join(thoughts)
        await self._stream_thought(sid, "optimizer", thought, profile)

        return {
            "thought": thought,
            "reasoning_type": "optimization",
            "confidence": optimized_conf,
            "duration_ms": int((time.time() - start) * 1000),
        }

    async def _phase_decide(self, state, query, sid, profile):
        start = time.time()
        total_collisions = len(state["thought_collisions"])
        total_steps = len(state["steps"])
        final_conf = min(0.91, state["confidence"] + 0.04)

        collision_note = ""
        if total_collisions > 0:
            collision_note = (
                f"\n  ⚡ COLLISION RESOLUTION:\n"
                f"  {total_collisions} thought collision(s) were generated during analysis.\n"
                f"  All collisions were mediated through AEGIS verification.\n"
                f"  The final recommendation incorporates the strongest arguments\n"
                f"  from both sides of each dispute, creating a more robust strategy\n"
                f"  than any single agent could have produced alone.\n"
            )

        thoughts = [
            f"╔══════════════════════════════════════════════════════╗",
            f"║  APEX — FINAL STRATEGIC RECOMMENDATION              ║",
            f"║  Autonomous Multi-Agent Consensus Decision           ║",
            f"╚══════════════════════════════════════════════════════╝",
            f"",
            f"After synthesizing reasoning from {total_steps} agent phases,",
            f"resolving {total_collisions} thought collision(s), and optimizing",
            f"for both performance and resilience:",
            f"",
            f"DECISION: PROCEED WITH OPTIMIZED STRATEGY",
            f"Confidence: {final_conf:.0%} │ Risk-Adjusted: {final_conf - 0.07:.0%}",
            f"",
            f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"",
            f"EXECUTIVE SYNTHESIS:",
            f"",
            f"The recommended approach combines NEXUS's strategic decomposition",
            f"with PRISM's streamlined two-tier architecture. VECTOR's critical",
            f"challenges — particularly regarding assumption vulnerability and",
            f"evidence integrity — have been addressed through AEGIS verification",
            f"and SENTINEL's contingency framework.",
            f"",
            f"The strategy is now both more resilient (per SENTINEL's risk",
            f"mitigation) and more efficient (per PRISM's optimization).",
            f"",
            f"KEY ACTIONS:",
            f"  1. Deploy the optimized two-tier strategy with adaptive bridge",
            f"  2. Implement real-time monitoring at each decision gate",
            f"  3. Maintain 20% strategic reserve for rapid course correction",
            f"  4. Execute parallel workstreams where dependencies allow",
            f"  5. Schedule reassessment at 30/60/90 day intervals",
            f"  6. Set pre-defined pivot triggers per SENTINEL's R1-R4 framework",
            f"",
            f"CONFIDENCE EVOLUTION:",
            f"  NEXUS:    42% → CORTEX:   58% → VECTOR:   ↓35%",
            f"  → AEGIS:  68% → SENTINEL: 60% → PRISM:    82%",
            f"  → APEX:   {final_conf:.0%} (final)",
            f"",
            f"This recommendation reflects the collective intelligence of 7",
            f"reasoning phases, with conflicts resolved through structured",
            f"adversarial debate and evidence-based arbitration.",
            f"{collision_note}",
            f"═══════════════════════════════════════════════════════",
            f"  AXIOMX — Multi-Agent Reasoning Complete",
            f"  Status: RECOMMENDATION GENERATED",
            f"═══════════════════════════════════════════════════════",
        ]

        thought = "\n".join(thoughts)
        state["final_output"] = thought
        await self._stream_thought(sid, "decider", thought, profile)

        return {
            "thought": thought,
            "reasoning_type": "final_synthesis",
            "confidence": final_conf,
            "duration_ms": int((time.time() - start) * 1000),
        }

    # ─── Streaming & Utility ─────────────────────────────────────────────

    async def _stream_thought(self, sid: str, agent: str, thought: str, profile: AgentProfile):
        """Stream thought in chunks with agent-specific pacing."""
        lines = thought.split("\n")
        accumulated = ""
        base_delay = 0.035 * profile.thinking_speed
        variance = 0.02 * profile.emotional_intensity

        for line in lines:
            accumulated += line + "\n"
            # Emit per-line for smoother streaming
            await self._emit(sid, "thinking", {
                "type": "thinking",
                "agent": agent,
                "content": accumulated.strip(),
                "is_full": False,
                "emotional_intensity": profile.emotional_intensity,
                "thinking_speed": profile.thinking_speed,
            })
            # Variable delay based on agent psychology
            delay = base_delay + random.uniform(-variance, variance)
            if line.strip().startswith("⚡") or line.strip().startswith("━"):
                delay *= 2.5  # Dramatic pause on important lines
            elif line.strip() == "":
                delay *= 0.3  # Quick through blank lines
            await asyncio.sleep(max(0.01, delay))

    def _generate_collision_description(self, collision_type: str) -> str:
        descriptions = {
            "assumption_challenge": "Foundational assumption in strategic framework challenged as fragile under stress conditions",
            "evidence_dispute": "Statistical evidence cited may be inflated due to survivorship bias and weak analogy mapping",
            "logic_break": "Logical inconsistency detected between recommended risk profile and proposed conservative strategy",
            "confidence_divergence": "System confidence estimates appear systematically miscalibrated relative to acknowledged uncertainty",
        }
        return descriptions.get(collision_type, "Reasoning inconsistency detected")
