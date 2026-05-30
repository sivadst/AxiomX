/* ═══════════════════════════════════════════════════════════════════════════
   AXIOMX — Agent Registry
   Visual showcase of all specialized AI agents in the network
   ═══════════════════════════════════════════════════════════════════════════ */

"use client";

import { motion } from "framer-motion";
import { AGENT_PROFILES } from "@/types";
import { useAxiomStore } from "@/stores/axiomStore";

export default function AgentRegistry() {
  const { steps, activeAgent } = useAxiomStore();
  const agents = Object.values(AGENT_PROFILES);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white tracking-wide mb-1">Agent Network</h3>
        <p className="text-xs text-[#475569]">
          8 specialized intelligence agents engineered for collaborative autonomous reasoning
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent, i) => {
          const isActive = activeAgent === agent.role;
          const agentSteps = steps.filter((s) => s.agent === agent.role);
          const hasContributed = agentSteps.length > 0;
          const avgConfidence = agentSteps.length
            ? agentSteps.reduce((sum, s) => sum + s.confidence, 0) / agentSteps.length
            : 0;

          return (
            <motion.div
              key={agent.role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, type: "spring", damping: 20 }}
              className="rounded-xl p-5 group cursor-default"
              style={{
                background: isActive
                  ? `rgba(${hexToRgb(agent.color)}, 0.06)`
                  : "rgba(5, 8, 22, 0.5)",
                border: `1px solid ${isActive ? `${agent.color}30` : "rgba(0,229,255,0.06)"}`,
                boxShadow: isActive ? `0 0 30px ${agent.color}10` : "none",
                transition: "all 0.3s ease",
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{
                      background: `${agent.color}12`,
                      border: `1px solid ${agent.color}25`,
                    }}
                    animate={
                      isActive
                        ? {
                            boxShadow: [
                              `0 0 10px ${agent.color}20`,
                              `0 0 25px ${agent.color}40`,
                              `0 0 10px ${agent.color}20`,
                            ],
                          }
                        : {}
                    }
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {agent.icon}
                  </motion.div>
                  <div>
                    <h4
                      className="text-sm font-mono font-bold tracking-widest"
                      style={{ color: agent.color }}
                    >
                      {agent.name}
                    </h4>
                    <p className="text-[10px] text-[#475569]">
                      {agent.role.replace(/_/g, " ").toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isActive && (
                    <motion.span
                      className="text-[9px] px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: `${agent.color}15`,
                        border: `1px solid ${agent.color}30`,
                        color: agent.color,
                      }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      ACTIVE
                    </motion.span>
                  )}
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: isActive ? agent.color : hasContributed ? "#10B981" : "#334155",
                      boxShadow: isActive ? `0 0 8px ${agent.color}` : "none",
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              <p className="text-[11px] text-[#94A3B8] leading-relaxed mb-3">
                {agent.description}
              </p>

              {/* Personality Tag */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[9px] text-[#475569] tracking-wider uppercase">
                  Personality:
                </span>
                <span className="text-[10px] text-[#64748B]">{agent.personality}</span>
              </div>

              {/* Stats */}
              {hasContributed && (
                <div className="flex items-center gap-4 pt-3 border-t" style={{ borderColor: `${agent.color}10` }}>
                  <div>
                    <div className="text-[9px] text-[#334155] uppercase">Steps</div>
                    <div className="text-xs font-mono" style={{ color: agent.color }}>
                      {agentSteps.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#334155] uppercase">Confidence</div>
                    <div className="text-xs font-mono" style={{ color: agent.color }}>
                      {(avgConfidence * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="h-0.5 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: agent.color }}
                        animate={{ width: `${avgConfidence * 100}%` }}
                        transition={{ type: "spring", damping: 20 }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0, 229, 255";
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}
