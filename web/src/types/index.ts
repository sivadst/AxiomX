/* ═══════════════════════════════════════════════════════════════════════════
   AXIOMX — Core Type Definitions v2.0
   Enhanced with Thought Collision system, confidence propagation,
   and psychologically distinct agent parameters
   ═══════════════════════════════════════════════════════════════════════════ */

export type AgentRole =
  | "strategic_planner"
  | "researcher"
  | "critic"
  | "verifier"
  | "risk_analyst"
  | "optimizer"
  | "memory"
  | "decider";

export type ScenarioMode =
  | "business_strategy"
  | "cybersecurity"
  | "scientific_research"
  | "startup_planning"
  | "debate"
  | "risk_forecasting"
  | "ai_decision";

export interface AgentProfile {
  role: AgentRole;
  name: string;
  color: string;
  icon: string;
  personality: string;
  description: string;
}

export interface ReasoningStep {
  agent: AgentRole;
  agent_name: string;
  thought: string;
  reasoning_type: string;
  confidence: number;
  is_contradiction: boolean;
  is_correction: boolean;
  duration_ms: number;
  emotional_intensity?: number;
  thinking_speed?: number;
  has_collision?: boolean;
  collision_severity?: number;
}

export interface AgentInteraction {
  from_agent: AgentRole;
  to_agent: AgentRole;
  interaction_type: "challenge" | "agree" | "delegate" | "verify";
  message: string;
  confidence_delta: number;
}

export interface GraphNode {
  id: string;
  type: string;
  label: string;
  agent: AgentRole | null;
  agent_name?: string;
  confidence: number | null;
  color?: string;
  importance?: number;
  is_contradiction?: boolean;
  pulse_intensity?: number;
  emotional_intensity?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  animated: boolean;
  label?: string;
  edge_type?: "flow" | "challenge" | "collision";
  strength?: number;
  is_collision?: boolean;
}

export interface Contradiction {
  agent: AgentRole;
  target_agent: AgentRole;
  issue: string;
  severity: number;
}

export interface ThoughtCollision {
  id: string;
  aggressor_agent: AgentRole;
  target_agent: AgentRole;
  collision_type: string;
  severity: number;
  description: string;
  resolved: boolean;
  ripple_agents: AgentRole[];
}

export interface ConfidenceShift {
  agent: AgentRole;
  from: number;
  to: number;
  delta: number;
}

export interface ReasoningSession {
  id: string;
  query: string;
  scenario_mode: ScenarioMode;
  status: "idle" | "reasoning" | "complete" | "error";
  steps: ReasoningStep[];
  interactions: AgentInteraction[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  contradictions: Contradiction[];
  thoughtCollisions: ThoughtCollision[];
  confidenceHistory: ConfidenceShift[];
  confidence: number;
  finalOutput: string | null;
  activeAgent: AgentRole | null;
  thinkingContent: string;
}

// ─── WebSocket Event Types ─────────────────────────────────────────────────

export interface WSSessionInitEvent {
  type: "session_init";
  query: string;
  scenario_mode: string;
  agents_count: number;
  estimated_steps: number;
}

export interface WSAgentStartEvent {
  type: "agent_start";
  agent: AgentRole;
  agent_name: string;
  agent_color: string;
  agent_icon: string;
  personality: string;
  step: number;
  total_steps: number;
  thinking_speed?: number;
  confidence_bias?: number;
  contrarian_tendency?: number;
  emotional_intensity?: number;
}

export interface WSThinkingEvent {
  type: "thinking";
  agent: AgentRole;
  content: string;
  is_full?: boolean;
  emotional_intensity?: number;
  thinking_speed?: number;
}

export interface WSAgentStepEvent {
  type: "agent_step";
  agent: AgentRole;
  agent_name: string;
  agent_color: string;
  agent_icon: string;
  step: ReasoningStep;
  graph_node: GraphNode;
  graph_edge: GraphEdge | null;
  overall_confidence: number;
  confidence_delta?: number;
  confidence_history?: ConfidenceShift[];
}

export interface WSContradictionEvent {
  type: "contradiction";
  contradiction: Contradiction;
}

export interface WSThoughtCollisionEvent {
  type: "thought_collision";
  collision: ThoughtCollision;
  severity: number;
  aggressor: AgentRole;
  aggressor_name: string;
  aggressor_color: string;
  target: AgentRole;
  target_name: string;
  target_color: string;
  collision_type: string;
  ripple_agents: AgentRole[];
}

export interface WSCollisionResolvedEvent {
  type: "collision_resolved";
  collision_id: string;
  resolver: AgentRole;
  resolver_name: string;
  verdict: string;
  adjusted_severity: number;
  confidence_impact: number;
}

export interface WSConfidenceShiftEvent {
  type: "confidence_shift";
  agent: AgentRole;
  from: number;
  to: number;
  delta: number;
  direction: "up" | "down";
}

export interface WSReasoningCompleteEvent {
  type: "reasoning_complete";
  final_output: string;
  confidence: number;
  total_steps: number;
  contradictions_found: number;
  thought_collisions: number;
  graph_nodes: GraphNode[];
  graph_edges: GraphEdge[];
  confidence_history: ConfidenceShift[];
}

export interface WSSessionCompleteEvent {
  type: "session_complete";
  session_id: string;
  confidence: number;
  total_steps: number;
  steps: ReasoningStep[];
  interactions: AgentInteraction[];
  graph_nodes: GraphNode[];
  graph_edges: GraphEdge[];
  contradictions: Contradiction[];
  final_output: string;
}

export type WSEvent =
  | WSSessionInitEvent
  | WSAgentStartEvent
  | WSThinkingEvent
  | WSAgentStepEvent
  | WSContradictionEvent
  | WSThoughtCollisionEvent
  | WSCollisionResolvedEvent
  | WSConfidenceShiftEvent
  | WSReasoningCompleteEvent
  | WSSessionCompleteEvent
  | { type: "error"; message: string }
  | { type: "pong" };

// ─── Agent Registry ────────────────────────────────────────────────────────

export const AGENT_PROFILES: Record<AgentRole, AgentProfile> = {
  strategic_planner: {
    role: "strategic_planner",
    name: "NEXUS",
    color: "#00E5FF",
    icon: "⚡",
    personality: "Methodical, visionary, decisive",
    description: "Decomposes complex problems into actionable strategic frameworks",
  },
  researcher: {
    role: "researcher",
    name: "CORTEX",
    color: "#3B82F6",
    icon: "🔬",
    personality: "Analytical, thorough, evidence-driven",
    description: "Gathers evidence, analyzes data, and provides comprehensive research",
  },
  critic: {
    role: "critic",
    name: "VECTOR",
    color: "#F59E0B",
    icon: "⚠️",
    personality: "Skeptical, sharp, uncompromising",
    description: "Challenges assumptions and identifies logical fallacies",
  },
  verifier: {
    role: "verifier",
    name: "AEGIS",
    color: "#10B981",
    icon: "✅",
    personality: "Precise, methodical, trustworthy",
    description: "Cross-checks facts and validates logic chains",
  },
  risk_analyst: {
    role: "risk_analyst",
    name: "SENTINEL",
    color: "#EF4444",
    icon: "🛡️",
    personality: "Cautious, strategic, protective",
    description: "Identifies risks, failure modes, and worst-case scenarios",
  },
  optimizer: {
    role: "optimizer",
    name: "PRISM",
    color: "#8B5CF6",
    icon: "💎",
    personality: "Creative, efficient, elegant",
    description: "Refines strategies and optimizes for maximum impact",
  },
  memory: {
    role: "memory",
    name: "ARCHIVE",
    color: "#6366F1",
    icon: "🧠",
    personality: "Persistent, contextual, consistent",
    description: "Maintains context and ensures consistency across sessions",
  },
  decider: {
    role: "decider",
    name: "APEX",
    color: "#F472B6",
    icon: "🎯",
    personality: "Authoritative, balanced, conclusive",
    description: "Synthesizes all inputs into the final strategic recommendation",
  },
};

export const SCENARIO_MODES: { mode: ScenarioMode; label: string; icon: string; description: string }[] = [
  { mode: "business_strategy", label: "Business Strategy", icon: "📊", description: "Strategic analysis and market positioning" },
  { mode: "cybersecurity", label: "Cybersecurity", icon: "🔐", description: "Threat analysis and security assessment" },
  { mode: "scientific_research", label: "Scientific Research", icon: "🧬", description: "Hypothesis evaluation and research design" },
  { mode: "startup_planning", label: "Startup Planning", icon: "🚀", description: "Venture strategy and growth planning" },
  { mode: "debate", label: "Debate Mode", icon: "⚔️", description: "Multi-perspective argument analysis" },
  { mode: "risk_forecasting", label: "Risk Forecasting", icon: "📉", description: "Predictive risk modeling and assessment" },
  { mode: "ai_decision", label: "AI Decision", icon: "🤖", description: "Autonomous decision simulation" },
];
