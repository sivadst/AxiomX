/* ═══════════════════════════════════════════════════════════════════════════
   AXIOMX — Agent Thinking Timeline
   Live, streaming visualization of multi-agent reasoning progression
   ═══════════════════════════════════════════════════════════════════════════ */

"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAxiomStore } from "@/stores/axiomStore";
import { AGENT_PROFILES } from "@/types";

export default function AgentTimeline() {
  const { steps, activeAgent, thinkingContent, status, confidence, contradictions } =
    useAxiomStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [steps, thinkingContent]);

  const isReasoning = status === "reasoning";

  return (
    <div className="flex flex-col h-full">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(0,229,255,0.06)]">
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium text-[#E2E8F0] tracking-wide">
            Agent Cognition Feed
          </div>
          {isReasoning && (
            <motion.div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(0,229,255,0.08)",
                border: "1px solid rgba(0,229,255,0.15)",
              }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-[10px] text-[#00E5FF] uppercase tracking-wider">Live</span>
            </motion.div>
          )}
        </div>
        <div className="text-[10px] text-[#475569] font-mono">
          {steps.length} steps • {contradictions.length} contradictions
        </div>
      </div>

      {/* ─── Timeline Content ───────────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {steps.map((step, i) => {
            const profile = AGENT_PROFILES[step.agent];
            return (
              <motion.div
                key={`step-${i}`}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", damping: 25 }}
                className="relative"
              >
                {/* Connection Line */}
                {i > 0 && (
                  <div
                    className="absolute left-[15px] -top-4 w-px h-4"
                    style={{ background: `linear-gradient(to bottom, transparent, ${profile.color}30)` }}
                  />
                )}

                <div
                  className="rounded-xl p-4"
                  style={{
                    background: `rgba(${hexToRgb(profile.color)}, 0.04)`,
                    border: `1px solid rgba(${hexToRgb(profile.color)}, 0.1)`,
                  }}
                >
                  {/* Agent Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                        style={{
                          background: `rgba(${hexToRgb(profile.color)}, 0.12)`,
                          border: `1px solid rgba(${hexToRgb(profile.color)}, 0.2)`,
                        }}
                      >
                        {profile.icon}
                      </div>
                      <div>
                        <div
                          className="text-xs font-mono font-bold tracking-wider"
                          style={{ color: profile.color }}
                        >
                          {profile.name}
                        </div>
                        <div className="text-[9px] text-[#475569]">{step.reasoning_type.replace(/_/g, " ").toUpperCase()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {step.is_contradiction && (
                        <motion.span
                          className="text-[9px] px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.2)",
                            color: "#EF4444",
                          }}
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          ⚠ CONTRADICTION
                        </motion.span>
                      )}
                      {step.is_correction && (
                        <span
                          className="text-[9px] px-2 py-0.5 rounded-full"
                          style={{
                            background: "rgba(16,185,129,0.1)",
                            border: "1px solid rgba(16,185,129,0.2)",
                            color: "#10B981",
                          }}
                        >
                          ↻ CORRECTED
                        </span>
                      )}
                      <div className="text-right">
                        <div className="text-[10px] font-mono" style={{ color: profile.color }}>
                          {(step.confidence * 100).toFixed(0)}%
                        </div>
                        <div className="text-[9px] text-[#334155]">
                          {step.duration_ms}ms
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Thought Content */}
                  <div className="text-xs text-[#94A3B8] leading-relaxed whitespace-pre-wrap font-[family-name:var(--font-geist-mono)] pl-9">
                    {step.thought}
                  </div>

                  {/* Confidence Bar */}
                  <div className="mt-3 pl-9">
                    <div className="h-0.5 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: profile.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${step.confidence * 100}%` }}
                        transition={{ delay: 0.3, type: "spring" }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* ─── Active Thinking Indicator ─────────────────────────── */}
          {activeAgent && thinkingContent && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-xl p-4"
              style={{
                background: `rgba(${hexToRgb(AGENT_PROFILES[activeAgent].color)}, 0.04)`,
                border: `1px solid rgba(${hexToRgb(AGENT_PROFILES[activeAgent].color)}, 0.15)`,
                boxShadow: `0 0 20px rgba(${hexToRgb(AGENT_PROFILES[activeAgent].color)}, 0.05)`,
              }}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                  style={{
                    background: `rgba(${hexToRgb(AGENT_PROFILES[activeAgent].color)}, 0.12)`,
                    border: `1px solid rgba(${hexToRgb(AGENT_PROFILES[activeAgent].color)}, 0.2)`,
                  }}
                >
                  {AGENT_PROFILES[activeAgent].icon}
                </div>
                <div
                  className="text-xs font-mono font-bold tracking-wider"
                  style={{ color: AGENT_PROFILES[activeAgent].color }}
                >
                  {AGENT_PROFILES[activeAgent].name}
                </div>
                <motion.div
                  className="flex gap-0.5"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div className="w-1 h-1 rounded-full" style={{ background: AGENT_PROFILES[activeAgent].color }} />
                  <div className="w-1 h-1 rounded-full" style={{ background: AGENT_PROFILES[activeAgent].color, opacity: 0.6 }} />
                  <div className="w-1 h-1 rounded-full" style={{ background: AGENT_PROFILES[activeAgent].color, opacity: 0.3 }} />
                </motion.div>
              </div>
              <div className="text-xs text-[#94A3B8] leading-relaxed whitespace-pre-wrap font-[family-name:var(--font-geist-mono)] pl-9">
                {thinkingContent}
                <motion.span
                  className="inline-block w-1.5 h-3.5 ml-0.5 -mb-0.5"
                  style={{ background: AGENT_PROFILES[activeAgent].color }}
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Idle State ──────────────────────────────────────────── */}
        {steps.length === 0 && !activeAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-center py-20"
          >
            <motion.div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: "rgba(0,229,255,0.05)",
                border: "1px solid rgba(0,229,255,0.1)",
              }}
              animate={{
                boxShadow: [
                  "0 0 15px rgba(0,229,255,0.05)",
                  "0 0 30px rgba(0,229,255,0.1)",
                  "0 0 15px rgba(0,229,255,0.05)",
                ],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <span className="text-2xl">◆</span>
            </motion.div>
            <p className="text-sm text-[#475569] mb-1">Agents Standing By</p>
            <p className="text-[11px] text-[#334155]">
              Submit a query to activate the reasoning network
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0, 229, 255";
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}
