/* ═══════════════════════════════════════════════════════════════════════════
   AXIOMX — Final Decision Panel
   Displays the synthesized strategic recommendation from APEX
   ═══════════════════════════════════════════════════════════════════════════ */

"use client";

import { motion } from "framer-motion";
import { useAxiomStore } from "@/stores/axiomStore";

export default function FinalDecision() {
  const { finalOutput, confidence, steps, contradictions, status } = useAxiomStore();

  if (status !== "complete" || !finalOutput) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", damping: 20 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(5, 8, 22, 0.8)",
        border: "1px solid rgba(0, 229, 255, 0.15)",
        boxShadow:
          "0 0 40px rgba(0, 229, 255, 0.05), inset 0 1px 0 rgba(0, 229, 255, 0.1)",
      }}
    >
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{
          background: "linear-gradient(135deg, rgba(0,229,255,0.06), rgba(59,130,246,0.04))",
          borderBottom: "1px solid rgba(0,229,255,0.08)",
        }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: "rgba(244,114,182,0.1)",
              border: "1px solid rgba(244,114,182,0.2)",
            }}
            animate={{
              boxShadow: [
                "0 0 10px rgba(244,114,182,0.1)",
                "0 0 25px rgba(244,114,182,0.2)",
                "0 0 10px rgba(244,114,182,0.1)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <span className="text-sm">🎯</span>
          </motion.div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              APEX — Final Strategic Recommendation
            </h3>
            <p className="text-[10px] text-[#475569]">
              Synthesized from {steps.length} reasoning steps
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {contradictions.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#EF4444]">⚠</span>
              <span className="text-[10px] font-mono text-[#EF4444]">
                {contradictions.length} resolved
              </span>
            </div>
          )}
          <div
            className="px-3 py-1 rounded-lg text-xs font-mono font-bold"
            style={{
              background:
                confidence > 0.8
                  ? "rgba(16,185,129,0.1)"
                  : "rgba(245,158,11,0.1)",
              border: `1px solid ${confidence > 0.8 ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`,
              color: confidence > 0.8 ? "#10B981" : "#F59E0B",
            }}
          >
            {(confidence * 100).toFixed(0)}% Confidence
          </div>
        </div>
      </div>

      {/* ─── Content ────────────────────────────────────────────────── */}
      <div className="px-6 py-5">
        <pre className="text-xs text-[#94A3B8] leading-relaxed whitespace-pre-wrap font-[family-name:var(--font-geist-mono)]">
          {finalOutput}
        </pre>
      </div>

      {/* ─── Footer ─────────────────────────────────────────────────── */}
      <div
        className="px-6 py-3 flex items-center justify-between"
        style={{ borderTop: "1px solid rgba(0,229,255,0.06)" }}
      >
        <div className="flex items-center gap-4">
          <span className="text-[9px] text-[#334155] tracking-wider uppercase">
            Verified by AEGIS • Optimized by PRISM
          </span>
        </div>
        <motion.button
          className="px-4 py-1.5 rounded-lg text-xs font-medium"
          style={{
            background: "rgba(0,229,255,0.08)",
            border: "1px solid rgba(0,229,255,0.15)",
            color: "#00E5FF",
          }}
          whileHover={{
            background: "rgba(0,229,255,0.12)",
            boxShadow: "0 0 15px rgba(0,229,255,0.1)",
          }}
          whileTap={{ scale: 0.97 }}
          onClick={() => useAxiomStore.getState().resetSession()}
        >
          New Analysis ↻
        </motion.button>
      </div>
    </motion.div>
  );
}
