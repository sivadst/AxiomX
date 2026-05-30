/* ═══════════════════════════════════════════════════════════════════════════
   AXIOMX — Command Input Panel
   The primary interface for initiating reasoning sessions
   ═══════════════════════════════════════════════════════════════════════════ */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAxiomStore } from "@/stores/axiomStore";
import { useReasoningSocket } from "@/hooks/useReasoningSocket";
import { SCENARIO_MODES } from "@/types";
import type { ScenarioMode } from "@/types";

export default function CommandInput() {
  const { query, scenarioMode, status, setQuery, setScenarioMode } = useAxiomStore();
  const { startReasoningSession } = useReasoningSocket();
  const [showModes, setShowModes] = useState(false);

  const isReasoning = status === "reasoning";

  const handleSubmit = () => {
    if (!query.trim() || isReasoning) return;
    startReasoningSession(query, scenarioMode);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const currentMode = SCENARIO_MODES.find((m) => m.mode === scenarioMode);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* ─── Title Section ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <motion.h2
          className="text-4xl font-bold tracking-tight mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-white">AXIOM</span>
          <span className="text-[#00E5FF] neon-glow">X</span>
        </motion.h2>
        <motion.p
          className="text-[#64748B] text-sm tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Multi-Agent Autonomous Intelligence Engine
        </motion.p>
      </motion.div>

      {/* ─── Input Container ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: "spring", damping: 20 }}
        className="glass-panel p-1"
        style={{
          boxShadow: isReasoning
            ? "0 0 40px rgba(0,229,255,0.1), inset 0 0 40px rgba(0,229,255,0.03)"
            : "0 0 20px rgba(0,229,255,0.03)",
        }}
      >
        <div className="relative">
          {/* Textarea */}
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your challenge. AXIOMX will deploy autonomous agents to analyze, debate, and synthesize strategic reasoning..."
            disabled={isReasoning}
            rows={3}
            className="w-full bg-transparent text-[#E2E8F0] placeholder-[#334155] text-sm leading-relaxed resize-none focus:outline-none p-5 pr-32 font-[family-name:var(--font-geist-sans)]"
          />

          {/* Controls Row */}
          <div className="flex items-center justify-between px-4 pb-3">
            {/* Scenario Mode Selector */}
            <div className="relative">
              <motion.button
                onClick={() => setShowModes(!showModes)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                style={{
                  background: "rgba(0,229,255,0.05)",
                  border: "1px solid rgba(0,229,255,0.1)",
                  color: "#94A3B8",
                }}
                whileHover={{ borderColor: "rgba(0,229,255,0.25)" }}
                whileTap={{ scale: 0.97 }}
              >
                <span>{currentMode?.icon}</span>
                <span>{currentMode?.label}</span>
                <span className="text-[#475569]">▾</span>
              </motion.button>

              <AnimatePresence>
                {showModes && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute bottom-full left-0 mb-2 w-72 rounded-xl overflow-hidden z-50"
                    style={{
                      background: "rgba(5, 8, 22, 0.95)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(0,229,255,0.1)",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                    }}
                  >
                    {SCENARIO_MODES.map((mode) => (
                      <motion.button
                        key={mode.mode}
                        onClick={() => {
                          setScenarioMode(mode.mode);
                          setShowModes(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors"
                        style={{
                          background:
                            scenarioMode === mode.mode
                              ? "rgba(0,229,255,0.08)"
                              : "transparent",
                          color: scenarioMode === mode.mode ? "#00E5FF" : "#94A3B8",
                          borderBottom: "1px solid rgba(0,229,255,0.04)",
                        }}
                        whileHover={{ background: "rgba(0,229,255,0.06)", x: 2 }}
                      >
                        <span className="text-lg">{mode.icon}</span>
                        <div>
                          <div className="font-medium">{mode.label}</div>
                          <div className="text-[10px] text-[#475569]">{mode.description}</div>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit Button */}
            <motion.button
              onClick={handleSubmit}
              disabled={!query.trim() || isReasoning}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: isReasoning
                  ? "rgba(0,229,255,0.1)"
                  : "linear-gradient(135deg, rgba(0,229,255,0.15), rgba(59,130,246,0.15))",
                border: "1px solid rgba(0,229,255,0.2)",
                color: "#00E5FF",
              }}
              whileHover={
                !isReasoning
                  ? {
                      boxShadow: "0 0 20px rgba(0,229,255,0.2)",
                      borderColor: "rgba(0,229,255,0.4)",
                    }
                  : {}
              }
              whileTap={!isReasoning ? { scale: 0.97 } : {}}
            >
              {isReasoning ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    ◆
                  </motion.span>
                  <span>Reasoning...</span>
                </>
              ) : (
                <>
                  <span>▶</span>
                  <span>Deploy Agents</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ─── Agent Deployment Hint ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center mt-4"
      >
        <p className="text-[11px] text-[#334155] tracking-wide">
          8 specialized agents • Real-time reasoning • Live debate &amp; verification
        </p>
      </motion.div>
    </div>
  );
}
