/* ═══════════════════════════════════════════════════════════════════════════
   AXIOMX — Zustand State Store v2.0
   Enhanced with thought collision tracking, confidence history,
   and collision resolution state
   ═══════════════════════════════════════════════════════════════════════════ */

import { create } from "zustand";
import type {
  AgentRole,
  ScenarioMode,
  ReasoningStep,
  AgentInteraction,
  GraphNode,
  GraphEdge,
  Contradiction,
  ThoughtCollision,
  ConfidenceShift,
  WSEvent,
} from "@/types";

interface AxiomState {
  // Session
  sessionId: string | null;
  query: string;
  scenarioMode: ScenarioMode;
  status: "idle" | "reasoning" | "complete" | "error";

  // Reasoning Data
  steps: ReasoningStep[];
  interactions: AgentInteraction[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  contradictions: Contradiction[];
  thoughtCollisions: ThoughtCollision[];
  confidenceHistory: ConfidenceShift[];
  confidence: number;
  finalOutput: string | null;

  // Agent State
  activeAgent: AgentRole | null;
  activeAgentMeta: {
    thinking_speed?: number;
    emotional_intensity?: number;
    contrarian_tendency?: number;
  };
  thinkingContent: string;
  currentStep: number;
  totalSteps: number;

  // Collision State
  activeCollision: ThoughtCollision | null;
  collisionPulseActive: boolean;

  // UI State
  sidebarOpen: boolean;
  activeView: "command" | "graph" | "timeline" | "agents";

  // Actions
  setQuery: (query: string) => void;
  setScenarioMode: (mode: ScenarioMode) => void;
  startReasoning: (sessionId: string) => void;
  handleWSEvent: (event: WSEvent) => void;
  resetSession: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveView: (view: "command" | "graph" | "timeline" | "agents") => void;
}

const initialState = {
  sessionId: null,
  query: "",
  scenarioMode: "business_strategy" as ScenarioMode,
  status: "idle" as const,
  steps: [],
  interactions: [],
  graphNodes: [],
  graphEdges: [],
  contradictions: [],
  thoughtCollisions: [],
  confidenceHistory: [],
  confidence: 0,
  finalOutput: null,
  activeAgent: null,
  activeAgentMeta: {},
  thinkingContent: "",
  currentStep: 0,
  totalSteps: 0,
  activeCollision: null,
  collisionPulseActive: false,
  sidebarOpen: true,
  activeView: "command" as const,
};

export const useAxiomStore = create<AxiomState>((set, get) => ({
  ...initialState,

  setQuery: (query) => set({ query }),
  setScenarioMode: (mode) => set({ scenarioMode: mode }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveView: (view) => set({ activeView: view }),

  startReasoning: (sessionId) =>
    set({
      sessionId,
      status: "reasoning",
      steps: [],
      interactions: [],
      graphNodes: [],
      graphEdges: [],
      contradictions: [],
      thoughtCollisions: [],
      confidenceHistory: [],
      confidence: 0,
      finalOutput: null,
      activeAgent: null,
      activeAgentMeta: {},
      thinkingContent: "",
      currentStep: 0,
      activeCollision: null,
      collisionPulseActive: false,
    }),

  handleWSEvent: (event) => {
    const state = get();

    switch (event.type) {
      case "session_init":
        // Dramatic initialization
        break;

      case "agent_start":
        set({
          activeAgent: event.agent,
          thinkingContent: "",
          currentStep: event.step,
          totalSteps: event.total_steps,
          activeAgentMeta: {
            thinking_speed: event.thinking_speed,
            emotional_intensity: event.emotional_intensity,
            contrarian_tendency: event.contrarian_tendency,
          },
        });
        break;

      case "thinking":
        // Replace entire content (server sends accumulated text)
        set({
          thinkingContent: event.content,
        });
        break;

      case "agent_step":
        set({
          steps: [...state.steps, event.step],
          graphNodes: event.graph_node
            ? [...state.graphNodes, event.graph_node]
            : state.graphNodes,
          graphEdges: event.graph_edge
            ? [...state.graphEdges, event.graph_edge]
            : state.graphEdges,
          confidence: event.overall_confidence,
          confidenceHistory: event.confidence_history || state.confidenceHistory,
          thinkingContent: "",
        });
        break;

      case "thought_collision":
        set({
          thoughtCollisions: [...state.thoughtCollisions, event.collision],
          activeCollision: event.collision,
          collisionPulseActive: true,
        });
        // Auto-clear pulse after 3 seconds
        setTimeout(() => {
          const current = get();
          if (current.activeCollision?.id === event.collision.id) {
            set({ collisionPulseActive: false });
          }
        }, 3000);
        break;

      case "collision_resolved":
        set({
          activeCollision: null,
          collisionPulseActive: false,
        });
        break;

      case "confidence_shift":
        set({
          confidenceHistory: [
            ...state.confidenceHistory,
            { agent: event.agent, from: event.from, to: event.to, delta: event.delta },
          ],
        });
        break;

      case "contradiction":
        set({
          contradictions: [...state.contradictions, event.contradiction],
        });
        break;

      case "reasoning_complete":
        set({
          confidence: event.confidence,
          finalOutput: event.final_output,
        });
        break;

      case "session_complete":
        set({
          status: "complete",
          steps: event.steps,
          interactions: event.interactions,
          graphNodes: event.graph_nodes,
          graphEdges: event.graph_edges,
          contradictions: event.contradictions,
          confidence: event.confidence,
          finalOutput: event.final_output,
          activeAgent: null,
          activeCollision: null,
          collisionPulseActive: false,
        });
        break;

      case "error":
        set({ status: "error" });
        break;
    }
  },

  resetSession: () => set(initialState),
}));
