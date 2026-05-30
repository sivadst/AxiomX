/* ═══════════════════════════════════════════════════════════════════════════
   AXIOMX — Command Center Sidebar
   The navigation spine of the intelligence operating system
   ═══════════════════════════════════════════════════════════════════════════ */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAxiomStore } from "@/stores/axiomStore";
import { AGENT_PROFILES } from "@/types";
import type { AgentRole } from "@/types";

const NAV_ITEMS = [
  { key: "command" as const, label: "Command Center", icon: "◆" },
  { key: "graph" as const, label: "Reasoning Graph", icon: "◈" },
  { key: "timeline" as const, label: "Agent Timeline", icon: "▹" },
  { key: "agents" as const, label: "Agent Registry", icon: "⬡" },
];

export default function Sidebar() {
  const { sidebarOpen, activeView, setActiveView, status, activeAgent, confidence, steps } =
    useAxiomStore();

  if (!sidebarOpen) return null;

  const agentList = Object.values(AGENT_PROFILES);
  const isReasoning = status === "reasoning";

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed left-0 top-0 bottom-0 w-72 z-40 flex flex-col"
      style={{
        background: "rgba(5, 8, 22, 0.92)",
        backdropFilter: "blur(30px)",
        borderRight: "1px solid rgba(0, 229, 255, 0.08)",
      }}
    >
      {/* ─── Logo ───────────────────────────────────────────────────── */}
      <div className="p-6 border-b border-[rgba(0,229,255,0.08)]">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(0,229,255,0.15), rgba(59,130,246,0.15))",
              border: "1px solid rgba(0,229,255,0.2)",
            }}
            animate={isReasoning ? { boxShadow: [
              "0 0 10px rgba(0,229,255,0.1)",
              "0 0 25px rgba(0,229,255,0.3)",
              "0 0 10px rgba(0,229,255,0.1)",
            ]} : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-lg font-bold text-[#00E5FF]">Ξ</span>
          </motion.div>
          <div>
            <h1 className="text-lg font-bold tracking-wider text-white">
              AXIOM<span className="text-[#00E5FF]">X</span>
            </h1>
            <p className="text-[10px] tracking-[0.2em] text-[#64748B] uppercase">
              Intelligence Engine
            </p>
          </div>
        </div>
      </div>

      {/* ─── System Status ──────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-[rgba(0,229,255,0.06)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] tracking-[0.15em] text-[#64748B] uppercase">
            System Status
          </span>
          <motion.div
            className="flex items-center gap-1.5"
            animate={isReasoning ? { opacity: [0.5, 1, 0.5] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: isReasoning ? "#00E5FF" : status === "complete" ? "#10B981" : "#64748B",
                boxShadow: isReasoning
                  ? "0 0 6px rgba(0,229,255,0.6)"
                  : status === "complete"
                  ? "0 0 6px rgba(16,185,129,0.6)"
                  : "none",
              }}
            />
            <span
              className="text-[10px] uppercase tracking-wider"
              style={{
                color: isReasoning ? "#00E5FF" : status === "complete" ? "#10B981" : "#64748B",
              }}
            >
              {isReasoning ? "REASONING" : status === "complete" ? "COMPLETE" : "STANDBY"}
            </span>
          </motion.div>
        </div>

        {/* Confidence Meter */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#94A3B8]">Confidence</span>
            <span className="text-xs font-mono text-[#00E5FF]">
              {(confidence * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-1 bg-[rgba(0,229,255,0.06)] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #00E5FF, #3B82F6)",
                boxShadow: "0 0 8px rgba(0,229,255,0.3)",
              }}
              animate={{ width: `${confidence * 100}%` }}
              transition={{ type: "spring", damping: 20 }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#94A3B8]">Steps</span>
            <span className="text-xs font-mono text-[#94A3B8]">{steps.length}</span>
          </div>
        </div>
      </div>

      {/* ─── Navigation ─────────────────────────────────────────────── */}
      <nav className="px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <motion.button
            key={item.key}
            onClick={() => setActiveView(item.key)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
            style={{
              background: activeView === item.key ? "rgba(0,229,255,0.08)" : "transparent",
              border: activeView === item.key
                ? "1px solid rgba(0,229,255,0.15)"
                : "1px solid transparent",
              color: activeView === item.key ? "#00E5FF" : "#94A3B8",
            }}
            whileHover={{
              background: "rgba(0,229,255,0.05)",
              x: 2,
            }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-base">{item.icon}</span>
            <span className="tracking-wide">{item.label}</span>
            {activeView === item.key && (
              <motion.div
                layoutId="nav-indicator"
                className="ml-auto w-1 h-4 rounded-full bg-[#00E5FF]"
                style={{ boxShadow: "0 0 8px rgba(0,229,255,0.5)" }}
              />
            )}
          </motion.button>
        ))}
      </nav>

      {/* ─── Active Agents ──────────────────────────────────────────── */}
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        <div className="text-[10px] tracking-[0.15em] text-[#64748B] uppercase mb-3">
          Agent Network
        </div>
        <div className="space-y-2">
          {agentList.map((agent) => {
            const isActive = activeAgent === agent.role;
            const hasContributed = steps.some((s) => s.agent === agent.role);

            return (
              <motion.div
                key={agent.role}
                className="flex items-center gap-3 px-3 py-2 rounded-lg"
                style={{
                  background: isActive ? `rgba(${hexToRgb(agent.color)}, 0.08)` : "transparent",
                  border: isActive
                    ? `1px solid rgba(${hexToRgb(agent.color)}, 0.2)`
                    : "1px solid transparent",
                }}
                animate={isActive ? { opacity: [0.7, 1, 0.7] } : { opacity: 1 }}
                transition={isActive ? { duration: 1.5, repeat: Infinity } : {}}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: isActive ? agent.color : hasContributed ? agent.color : "#334155",
                    boxShadow: isActive ? `0 0 8px ${agent.color}60` : "none",
                    opacity: hasContributed ? 1 : 0.3,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs font-mono truncate"
                    style={{ color: isActive ? agent.color : hasContributed ? "#E2E8F0" : "#475569" }}
                  >
                    {agent.name}
                  </div>
                  <div className="text-[9px] text-[#475569] truncate">{agent.personality}</div>
                </div>
                {isActive && (
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: agent.color }}
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ─── Footer ─────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-t border-[rgba(0,229,255,0.06)]">
        <div className="text-[9px] text-[#334155] text-center tracking-wider uppercase">
          AXIOMX v1.0 • Multi-Agent Reasoning
        </div>
      </div>
    </motion.aside>
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0, 229, 255";
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}
