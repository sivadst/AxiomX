/* ═══════════════════════════════════════════════════════════════════════════
   AXIOMX — Agent Thinking Timeline v3.0 (CINEMATIC COGNITION FEED)
   ═══════════════════════════════════════════════════════════════════════════ */

"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAxiomStore } from "@/stores/axiomStore";
import { AGENT_PROFILES } from "@/types";

export default function AgentTimeline() {
  const { steps, activeAgent, activeAgentMeta, thinkingContent, status, contradictions, collisionPulseActive, activeCollision } =
    useAxiomStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [steps, thinkingContent, collisionPulseActive]);

  const isReasoning = status === "reasoning";

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* ─── Ambient Turbulence ───────────────────────────────────────── */}
      <AnimatePresence>
        {collisionPulseActive && (
          <motion.div
            key="timeline-turbulence"
            className="absolute inset-0 z-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.08, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{
              background: "linear-gradient(to bottom, rgba(239,68,68,0.2) 0%, transparent 100%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 bg-[rgba(5,8,22,0.85)] backdrop-blur-xl border-b border-[rgba(0,229,255,0.06)]">
        <div className="flex items-center gap-4">
          <div className="text-xs font-bold text-white tracking-[0.15em] uppercase drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]">
            Live Cognition Stream
          </div>
          {isReasoning && (
            <motion.div
              className="flex items-center gap-2 px-2.5 py-0.5 rounded-sm backdrop-blur-md"
              style={{
                background: "rgba(0,229,255,0.1)",
                border: "1px solid rgba(0,229,255,0.2)",
              }}
              animate={{ boxShadow: ["0 0 10px rgba(0,229,255,0.1)", "0 0 20px rgba(0,229,255,0.2)", "0 0 10px rgba(0,229,255,0.1)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
              <span className="text-[9px] font-mono text-[#00E5FF] tracking-widest uppercase">Streaming</span>
            </motion.div>
          )}
        </div>
        <div className="text-[10px] font-mono tracking-wider text-[#475569]">
          {steps.length} EVENTS • {contradictions.length} ANOMALIES
        </div>
      </div>

      {/* ─── Timeline Content ───────────────────────────────────────── */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-6 py-5 space-y-6 scroll-smooth">
        <AnimatePresence mode="popLayout">
          {steps.map((step, i) => {
            const profile = AGENT_PROFILES[step.agent];
            const isCollision = step.has_collision;
            const blockColor = isCollision ? "#EF4444" : profile.color;

            return (
              <motion.div
                key={`step-${i}`}
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ type: "spring", damping: 20, stiffness: 200 }}
                className="relative"
              >
                {/* Flow Line */}
                {i > 0 && (
                  <motion.div
                    className="absolute left-[19px] -top-6 w-[2px] h-6"
                    style={{
                      background: `linear-gradient(to bottom, transparent, ${blockColor}60)`,
                      boxShadow: `0 0 8px ${blockColor}40`,
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: 24 }}
                    transition={{ duration: 0.4 }}
                  />
                )}

                <div
                  className="rounded-xl p-5 backdrop-blur-md relative overflow-hidden group"
                  style={{
                    background: isCollision ? "rgba(30,10,10,0.6)" : `rgba(5,8,22,0.7)`,
                    border: `1px solid ${isCollision ? "rgba(239,68,68,0.3)" : `${blockColor}25`}`,
                    boxShadow: isCollision ? "0 5px 20px rgba(239,68,68,0.1)" : `0 5px 15px rgba(0,0,0,0.4)`,
                  }}
                >
                  {/* Background Glow */}
                  <div 
                    className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none opacity-20 blur-3xl transition-opacity group-hover:opacity-40" 
                    style={{ background: blockColor }} 
                  />

                  {/* Agent Header */}
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg relative"
                        style={{
                          background: `rgba(${hexToRgb(blockColor)}, 0.1)`,
                          border: `1px solid rgba(${hexToRgb(blockColor)}, 0.25)`,
                        }}
                      >
                        {profile.icon}
                        {isCollision && (
                          <motion.div 
                            className="absolute -inset-1 border border-red-500 rounded-lg opacity-50"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-mono font-bold tracking-widest uppercase" style={{ color: blockColor, textShadow: `0 0 10px ${blockColor}40` }}>
                          {profile.name}
                        </div>
                        <div className="text-[10px] text-[#475569] uppercase tracking-wider">{step.reasoning_type.replace(/_/g, " ")}</div>
                      </div>
                    </div>
                    
                    {/* Status Badges */}
                    <div className="flex items-center gap-3">
                      {isCollision && (
                        <motion.div
                          className="px-2.5 py-1 rounded-sm text-[9px] font-bold tracking-widest font-mono"
                          style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)" }}
                          animate={{ opacity: [0.6, 1, 0.6] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                        >
                          ⚠ INSTABILITY
                        </motion.div>
                      )}
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold" style={{ color: blockColor }}>
                          {(step.confidence * 100).toFixed(0)}%
                        </div>
                        <div className="text-[9px] text-[#475569]">{step.duration_ms}ms</div>
                      </div>
                    </div>
                  </div>

                  {/* Thought Content */}
                  <div className="text-xs text-[#E2E8F0] leading-[1.8] whitespace-pre-wrap font-[family-name:var(--font-geist-mono)] pl-[3.25rem] relative z-10">
                    {step.thought.split('\n').map((line, idx) => (
                      <span key={idx} className={line.startsWith('⚡') || line.startsWith('◈') ? "text-white font-bold" : ""}>
                        {line}
                        {idx !== step.thought.split('\n').length - 1 && <br/>}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* ─── Active Thinking Hologram ──────────────────────────── */}
          {activeAgent && thinkingContent && (
            <motion.div
              key="active-thinking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative"
            >
              <div
                className="rounded-xl p-5 backdrop-blur-xl relative overflow-hidden"
                style={{
                  background: `rgba(${hexToRgb(AGENT_PROFILES[activeAgent].color)}, 0.05)`,
                  border: `1px solid rgba(${hexToRgb(AGENT_PROFILES[activeAgent].color)}, 0.3)`,
                  boxShadow: `0 0 30px rgba(${hexToRgb(AGENT_PROFILES[activeAgent].color)}, 0.1), inset 0 0 20px rgba(${hexToRgb(AGENT_PROFILES[activeAgent].color)}, 0.05)`,
                }}
              >
                {/* Active Scanline Effect */}
                <motion.div
                  className="absolute top-0 left-0 w-full h-[2px] opacity-30"
                  style={{ background: AGENT_PROFILES[activeAgent].color, boxShadow: `0 0 10px ${AGENT_PROFILES[activeAgent].color}` }}
                  animate={{ y: [0, 300, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />

                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg relative"
                    style={{ background: `rgba(${hexToRgb(AGENT_PROFILES[activeAgent].color)}, 0.15)`, border: `1px solid rgba(${hexToRgb(AGENT_PROFILES[activeAgent].color)}, 0.4)` }}
                  >
                    {AGENT_PROFILES[activeAgent].icon}
                  </div>
                  <div className="text-sm font-mono font-bold tracking-widest uppercase" style={{ color: AGENT_PROFILES[activeAgent].color, textShadow: `0 0 10px ${AGENT_PROFILES[activeAgent].color}80` }}>
                    {AGENT_PROFILES[activeAgent].name}
                  </div>
                  
                  {/* Thinking Pulse */}
                  <motion.div className="flex gap-1 ml-2" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.8 + (1 - (activeAgentMeta.emotional_intensity || 0.5)), repeat: Infinity }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: AGENT_PROFILES[activeAgent].color }} />
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: AGENT_PROFILES[activeAgent].color, opacity: 0.6 }} />
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: AGENT_PROFILES[activeAgent].color, opacity: 0.3 }} />
                  </motion.div>
                </div>

                <div className="text-xs text-[#E2E8F0] leading-[1.8] whitespace-pre-wrap font-[family-name:var(--font-geist-mono)] pl-[3.25rem]">
                  {thinkingContent}
                  <motion.span
                    className="inline-block w-2 h-4 ml-1 align-middle"
                    style={{ background: AGENT_PROFILES[activeAgent].color, boxShadow: `0 0 8px ${AGENT_PROFILES[activeAgent].color}` }}
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: (activeAgentMeta.thinking_speed || 1) * 0.5, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Idle State ──────────────────────────────────────────── */}
        {steps.length === 0 && !activeAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-center py-20 pointer-events-none"
          >
            <motion.div
              className="w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 relative"
              style={{ background: "rgba(0,229,255,0.02)", border: "1px solid rgba(0,229,255,0.08)" }}
            >
              <motion.div 
                className="absolute inset-0 rounded-[2rem] border border-[#00E5FF] opacity-10"
                animate={{ rotate: 180 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
              <span className="text-3xl text-[#00E5FF] opacity-30">⚡</span>
            </motion.div>
            <p className="text-sm font-bold tracking-[0.2em] text-[#E2E8F0] mb-2 uppercase drop-shadow-md">Systems Standby</p>
            <p className="text-[11px] font-mono tracking-widest text-[#475569] uppercase">
              Network ready for autonomous deployment
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
