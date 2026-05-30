/* ═══════════════════════════════════════════════════════════════════════════
   AXIOMX — Zustand State Store
   Central state management for the reasoning platform
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
  confidence: number;
  finalOutput: string | null;

  // Agent State
  activeAgent: AgentRole | null;
  thinkingContent: string;
  currentStep: number;
  totalSteps: number;

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
  confidence: 0,
  finalOutput: null,
  activeAgent: null,
  thinkingContent: "",
  currentStep: 0,
  totalSteps: 0,
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
      confidence: 0,
      finalOutput: null,
      activeAgent: null,
      thinkingContent: "",
      currentStep: 0,
    }),

  handleWSEvent: (event) => {
    const state = get();

    switch (event.type) {
      case "agent_start":
        set({
          activeAgent: event.agent,
          thinkingContent: "",
          currentStep: event.step,
          totalSteps: event.total_steps,
        });
        break;

      case "thinking":
        set({
          thinkingContent: state.thinkingContent + " " + event.content,
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
          thinkingContent: "",
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
        });
        break;

      case "error":
        set({ status: "error" });
        break;
    }
  },

  resetSession: () => set(initialState),
}));
