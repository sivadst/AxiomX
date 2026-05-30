/* ═══════════════════════════════════════════════════════════════════════════
   AXIOMX — Telemetry Dashboard
   Real-time system metrics and intelligence indicators
   ═══════════════════════════════════════════════════════════════════════════ */

"use client";

import { motion } from "framer-motion";
import { useAxiomStore } from "@/stores/axiomStore";
import { AGENT_PROFILES } from "@/types";

export default function TelemetryPanel() {
  const { steps, confidence, contradictions, status, activeAgent, interactions } = useAxiomStore();

  const metrics = [
    {
      label: "CONFIDENCE",
      value: `${(confidence * 100).toFixed(0)}%`,
      color: confidence > 0.7 ? "#10B981" : confidence > 0.4 ? "#F59E0B" : "#EF4444",
      progress: confidence,
    },
    {
      label: "AGENTS ACTIVE",
      value: `${new Set(steps.map((s) => s.agent)).size}/8`,
      color: "#00E5FF",
      progress: new Set(steps.map((s) => s.agent)).size / 8,
    },
    {
      label: "REASONING STEPS",
      value: steps.length.toString(),
      color: "#3B82F6",
      progress: Math.min(steps.length / 7, 1),
    },
    {
      label: "CONTRADICTIONS",
      value: contradictions.length.toString(),
      color: contradictions.length > 0 ? "#EF4444" : "#334155",
      progress: Math.min(contradictions.length / 3, 1),
    },
  ];

  return (
    <div className="space-y-4">
      {/* ─── Metric Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl p-3.5"
            style={{
              background: "rgba(5, 8, 22, 0.6)",
              border: "1px solid rgba(0,229,255,0.06)",
            }}
          >
            <div className="text-[9px] tracking-[0.15em] text-[#475569] uppercase mb-1.5">
              {metric.label}
            </div>
            <div className="flex items-end justify-between">
              <span className="text-xl font-mono font-bold" style={{ color: metric.color }}>
                {metric.value}
              </span>
            </div>
            <div className="mt-2 h-0.5 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: metric.color }}
                animate={{ width: `${metric.progress * 100}%` }}
                transition={{ type: "spring", damping: 20 }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── Agent Activity Ring ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl p-4"
        style={{
          background: "rgba(5, 8, 22, 0.6)",
          border: "1px solid rgba(0,229,255,0.06)",
        }}
      >
        <div className="text-[9px] tracking-[0.15em] text-[#475569] uppercase mb-3">
          Agent Performance
        </div>
        <div className="space-y-2">
          {Object.values(AGENT_PROFILES).map((agent) => {
            const agentSteps = steps.filter((s) => s.agent === agent.role);
            const isActive = activeAgent === agent.role;
            const avgConfidence = agentSteps.length
              ? agentSteps.reduce((sum, s) => sum + s.confidence, 0) / agentSteps.length
              : 0;

            return (
              <div key={agent.role} className="flex items-center gap-2.5">
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center text-[10px]"
                  style={{
                    background: `${agent.color}15`,
                    border: `1px solid ${agent.color}25`,
                    opacity: agentSteps.length ? 1 : 0.3,
                  }}
                >
                  {agent.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span
                      className="text-[10px] font-mono"
                      style={{
                        color: isActive ? agent.color : agentSteps.length ? "#94A3B8" : "#334155",
                      }}
                    >
                      {agent.name}
                    </span>
                    {agentSteps.length > 0 && (
                      <span className="text-[9px] font-mono" style={{ color: `${agent.color}99` }}>
                        {(avgConfidence * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <div className="h-px bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: agent.color, opacity: 0.6 }}
                      animate={{ width: `${avgConfidence * 100}%` }}
                      transition={{ type: "spring", damping: 20 }}
                    />
                  </div>
                </div>
                {isActive && (
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: agent.color }}
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ─── Interaction Log ─────────────────────────────────────── */}
      {interactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl p-4"
          style={{
            background: "rgba(5, 8, 22, 0.6)",
            border: "1px solid rgba(0,229,255,0.06)",
          }}
        >
          <div className="text-[9px] tracking-[0.15em] text-[#475569] uppercase mb-3">
            Agent Interactions
          </div>
          <div className="space-y-2">
            {interactions.map((interaction, i) => {
              const fromProfile = AGENT_PROFILES[interaction.from_agent];
              const toProfile = AGENT_PROFILES[interaction.to_agent];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-2 text-[10px]"
                >
                  <span style={{ color: fromProfile.color }} className="font-mono font-bold">
                    {fromProfile.name}
                  </span>
                  <span className="text-[#334155]">→</span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px]"
                    style={{
                      background:
                        interaction.interaction_type === "challenge"
                          ? "rgba(239,68,68,0.1)"
                          : "rgba(16,185,129,0.1)",
                      color:
                        interaction.interaction_type === "challenge"
                          ? "#EF4444"
                          : "#10B981",
                    }}
                  >
                    {interaction.interaction_type}
                  </span>
                  <span className="text-[#334155]">→</span>
                  <span style={{ color: toProfile.color }} className="font-mono font-bold">
                    {toProfile.name}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
