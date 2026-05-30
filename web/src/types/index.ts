/* ═══════════════════════════════════════════════════════════════════════════
   AXIOMX — Core Type Definitions
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
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  animated: boolean;
  label?: string;
}

export interface Contradiction {
  agent: AgentRole;
  target_agent: AgentRole;
  issue: string;
  severity: number;
}

export interface ReasoningSession {
  id: string;
  query: string;
  scenario_mode: ScenarioMode;
  status: "idle" | "reasoning" | "complete" | "error";
  steps: ReasoningStep[];
  interactions: AgentInteraction[];
  graph_nodes: GraphNode[];
  graph_edges: GraphEdge[];
  contradictions: Contradiction[];
  confidence: number;
  final_output: string | null;
  active_agent: AgentRole | null;
  thinking_content: string;
}

// ─── WebSocket Event Types ─────────────────────────────────────────────────

export interface WSAgentStartEvent {
  type: "agent_start";
  agent: AgentRole;
  agent_name: string;
  agent_color: string;
  agent_icon: string;
  personality: string;
  step: number;
  total_steps: number;
}

export interface WSThinkingEvent {
  type: "thinking";
  agent: AgentRole;
  content: string;
  chunk_index: number;
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
}

export interface WSContradictionEvent {
  type: "contradiction";
  contradiction: Contradiction;
}

export interface WSReasoningCompleteEvent {
  type: "reasoning_complete";
  final_output: string;
  confidence: number;
  total_steps: number;
  contradictions_found: number;
  graph_nodes: GraphNode[];
  graph_edges: GraphEdge[];
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
  | WSAgentStartEvent
  | WSThinkingEvent
  | WSAgentStepEvent
  | WSContradictionEvent
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
