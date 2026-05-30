/* ═══════════════════════════════════════════════════════════════════════════
   AXIOMX — Command Center
   The main page of the autonomous intelligence operating system
   ═══════════════════════════════════════════════════════════════════════════ */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useAxiomStore } from "@/stores/axiomStore";
import Sidebar from "@/components/layout/Sidebar";
import CommandInput from "@/components/reasoning/CommandInput";
import AgentTimeline from "@/components/reasoning/AgentTimeline";
import TelemetryPanel from "@/components/reasoning/TelemetryPanel";
import FinalDecision from "@/components/reasoning/FinalDecision";
import AgentRegistry from "@/components/agents/AgentRegistry";

// Dynamic imports for heavy components
const NeuralBackground = dynamic(
  () => import("@/components/effects/NeuralBackground"),
  { ssr: false }
);
const ReasoningGraph = dynamic(
  () => import("@/components/reasoning/ReasoningGraph"),
  { ssr: false }
);

export default function CommandCenter() {
  const { status, activeView, sidebarOpen } = useAxiomStore();
  const isIdle = status === "idle";
  const isReasoning = status === "reasoning";
  const isComplete = status === "complete";

  return (
    <div className="relative min-h-screen cosmic-bg neural-grid">
      {/* ─── Background ─────────────────────────────────────────────── */}
      <NeuralBackground />

      {/* ─── Scan Line Effect ───────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none overflow-hidden"
        style={{ opacity: 0.03 }}
      >
        <motion.div
          className="w-full h-px bg-[#00E5FF]"
          animate={{ y: ["-100%", "100vh"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* ─── Sidebar ────────────────────────────────────────────────── */}
      <Sidebar />

      {/* ─── Main Content ───────────────────────────────────────────── */}
      <main
        className="relative z-10 transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? "288px" : "0" }}
      >
        {/* ─── Top Bar ──────────────────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-30 flex items-center justify-between px-6 py-3"
          style={{
            background: "rgba(5, 8, 22, 0.7)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(0,229,255,0.06)",
          }}
        >
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => useAxiomStore.getState().setSidebarOpen(true)}
                className="text-[#475569] hover:text-[#00E5FF] transition-colors"
              >
                ☰
              </button>
            )}
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{
                  background: isReasoning ? "#00E5FF" : isComplete ? "#10B981" : "#334155",
                  boxShadow: isReasoning ? "0 0 8px rgba(0,229,255,0.5)" : "none",
                }}
                animate={isReasoning ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-xs text-[#475569] font-mono tracking-wider uppercase">
                {isReasoning ? "REASONING IN PROGRESS" : isComplete ? "ANALYSIS COMPLETE" : "AWAITING INPUT"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[9px] text-[#334155] font-mono">v1.0.0</span>
            <div className="w-px h-4 bg-[rgba(0,229,255,0.1)]" />
            <span className="text-[9px] text-[#334155] font-mono tracking-wider">AXIOMX ENGINE</span>
          </div>
        </motion.header>

        {/* ─── Content Area ─────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {/* Command Center View */}
          {activeView === "command" && (
            <motion.div
              key="command"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Command Input (Hero Section) */}
              {isIdle && (
                <motion.div
                  className="flex items-center justify-center min-h-[50vh] px-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <CommandInput />
                </motion.div>
              )}

              {/* Active Reasoning Layout */}
              {(isReasoning || isComplete) && (
                <div className="p-6">
                  {/* Compact Input */}
                  <div className="mb-6">
                    <CommandInput />
                  </div>

                  {/* Split Layout: Timeline + Telemetry */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Timeline Panel */}
                    <div
                      className="lg:col-span-2 rounded-2xl overflow-hidden"
                      style={{
                        background: "rgba(5, 8, 22, 0.6)",
                        border: "1px solid rgba(0,229,255,0.06)",
                        minHeight: "500px",
                      }}
                    >
                      <AgentTimeline />
                    </div>

                    {/* Telemetry Sidebar */}
                    <div className="space-y-4">
                      <TelemetryPanel />
                    </div>
                  </div>

                  {/* Final Decision */}
                  {isComplete && (
                    <div className="mt-6">
                      <FinalDecision />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Graph View */}
          {activeView === "graph" && (
            <motion.div
              key="graph"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6"
            >
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(5, 8, 22, 0.6)",
                  border: "1px solid rgba(0,229,255,0.06)",
                  height: "calc(100vh - 120px)",
                }}
              >
                <ReasoningGraph />
              </div>
            </motion.div>
          )}

          {/* Timeline View */}
          {activeView === "timeline" && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div
                  className="lg:col-span-2 rounded-2xl overflow-hidden"
                  style={{
                    background: "rgba(5, 8, 22, 0.6)",
                    border: "1px solid rgba(0,229,255,0.06)",
                    height: "calc(100vh - 120px)",
                  }}
                >
                  <AgentTimeline />
                </div>
                <div>
                  <TelemetryPanel />
                </div>
              </div>
            </motion.div>
          )}

          {/* Agents View */}
          {activeView === "agents" && (
            <motion.div
              key="agents"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AgentRegistry />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
