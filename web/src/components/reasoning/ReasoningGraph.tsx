/* ═══════════════════════════════════════════════════════════════════════════
   AXIOMX — Interactive Reasoning Graph v2.0
   ═══════════════════════════════════════════════════════════════════════════
   
   THE SIGNATURE FEATURE — A living intelligence visualization.
   
   Nodes:
   - Scale by importance
   - Pulse by emotional intensity
   - Glow by confidence
   - Shake during contradictions
   - Fade when weak
   
   Edges:
   - Flow particles along connections
   - Turn red during collisions
   - Vary thickness by strength
   - Animate differently for challenge vs. flow
   
   The graph reorganizes dynamically, centralizing dominant logic
   and fading weak branches.
   ═══════════════════════════════════════════════════════════════════════════ */

"use client";

import { useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAxiomStore } from "@/stores/axiomStore";
import { AGENT_PROFILES } from "@/types";

/* ─── Custom Reasoning Node ──────────────────────────────────────────────── */

function ReasoningNode({ data }: NodeProps) {
  const isQuery = data.nodeType === "query";
  const isCollisionNode = data.nodeType === "collision";
  const color = (data.color as string) || "#00E5FF";
  const confidence = (data.confidence as number) || 0;
  const agentName = (data.agentName as string) || "";
  const importance = (data.importance as number) || 0.5;
  const pulseIntensity = (data.pulseIntensity as number) || 0.5;
  const emotionalIntensity = (data.emotionalIntensity as number) || 0.5;
  const isContradiction = data.isContradiction as boolean;

  // Scale node size by importance
  const scale = 0.85 + importance * 0.3;
  const maxWidth = isQuery ? 300 : isCollisionNode ? 260 : 280;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, rotate: isCollisionNode ? -5 : 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        rotate: 0,
      }}
      transition={{
        type: "spring",
        damping: isCollisionNode ? 10 : 18,
        stiffness: isCollisionNode ? 300 : 200,
      }}
      className="relative group"
      style={{ transform: `scale(${scale})` }}
    >
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-3 !h-3" />

      {/* Ambient Glow Ring — pulses based on emotional intensity */}
      <motion.div
        className="absolute -inset-3 rounded-2xl pointer-events-none"
        style={{
          background: isCollisionNode
            ? `radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)`
            : `radial-gradient(circle, ${color}12 0%, transparent 70%)`,
        }}
        animate={{
          opacity: [0.3, 0.6 + emotionalIntensity * 0.4, 0.3],
          scale: [1, 1 + pulseIntensity * 0.08, 1],
        }}
        transition={{
          duration: 2 + (1 - emotionalIntensity) * 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Collision Shockwave Ring */}
      {isContradiction && (
        <motion.div
          className="absolute -inset-6 rounded-3xl pointer-events-none"
          style={{
            border: `2px solid ${isCollisionNode ? "rgba(239,68,68,0.3)" : `${color}30`}`,
          }}
          initial={{ scale: 0.5, opacity: 1 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
      )}

      {/* Node Body */}
      <div
        className="relative rounded-xl cursor-pointer transition-all duration-300"
        style={{
          width: maxWidth,
          padding: isQuery ? "16px 20px" : "12px 16px",
          background: isCollisionNode
            ? "rgba(239, 68, 68, 0.06)"
            : isQuery
            ? "rgba(0, 229, 255, 0.06)"
            : `rgba(${hexToRgb(color)}, 0.04)`,
          border: isCollisionNode
            ? "1px solid rgba(239, 68, 68, 0.25)"
            : `1px solid ${isQuery ? "rgba(0,229,255,0.2)" : `${color}20`}`,
          boxShadow: isCollisionNode
            ? "0 0 30px rgba(239,68,68,0.08), inset 0 0 20px rgba(239,68,68,0.03)"
            : `0 0 20px ${color}06`,
          // Fade weak nodes
          opacity: importance < 0.3 ? 0.5 : 1,
        }}
      >
        {/* Agent Identity Badge */}
        {!isQuery && (
          <div className="flex items-center gap-2 mb-2">
            {/* Pulse Dot */}
            <motion.div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{
                background: isCollisionNode ? "#EF4444" : color,
                boxShadow: `0 0 ${4 + pulseIntensity * 6}px ${isCollisionNode ? "#EF4444" : color}`,
              }}
              animate={{
                scale: [1, 1 + pulseIntensity * 0.5, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 1 + (1 - emotionalIntensity) * 1.5,
                repeat: Infinity,
              }}
            />
            <span
              className="text-[10px] font-mono font-bold tracking-[0.15em]"
              style={{ color: isCollisionNode ? "#EF4444" : color }}
            >
              {agentName}
            </span>
            {isCollisionNode && (
              <motion.span
                className="text-[8px] px-1.5 py-0.5 rounded font-bold tracking-wider ml-auto"
                style={{
                  background: "rgba(239,68,68,0.15)",
                  color: "#EF4444",
                  border: "1px solid rgba(239,68,68,0.25)",
                }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                COLLISION
              </motion.span>
            )}
            {!isCollisionNode && (
              <span
                className="ml-auto text-[9px] font-mono"
                style={{ color: `${color}99` }}
              >
                {(confidence * 100).toFixed(0)}%
              </span>
            )}
          </div>
        )}

        {/* Content */}
        <p
          className={`text-[10px] leading-relaxed ${
            isQuery ? "text-[#00E5FF] font-medium" : isCollisionNode ? "text-[#FCA5A5]" : "text-[#8893A7]"
          }`}
          style={{
            fontFamily: isQuery ? undefined : "var(--font-geist-mono)",
            display: "-webkit-box",
            WebkitLineClamp: isQuery ? 3 : 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {isQuery ? "📡 " : isCollisionNode ? "⚡ " : ""}
          {data.label as string}
        </p>

        {/* Confidence Bar with gradient */}
        {!isQuery && !isCollisionNode && (
          <div className="mt-2.5 h-[3px] bg-[rgba(255,255,255,0.03)] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${color}40, ${color})`,
                boxShadow: `0 0 4px ${color}40`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${confidence * 100}%` }}
              transition={{ delay: 0.3, type: "spring", damping: 20 }}
            />
          </div>
        )}

        {/* Collision severity bar */}
        {isCollisionNode && (
          <div className="mt-2.5 h-[3px] bg-[rgba(239,68,68,0.06)] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, rgba(239,68,68,0.4), #EF4444)",
                boxShadow: "0 0 4px rgba(239,68,68,0.4)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${(1 - confidence) * 100}%` }}
              transition={{ delay: 0.3, type: "spring" }}
            />
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-3 !h-3" />
    </motion.div>
  );
}

const nodeTypes = { reasoning: ReasoningNode };

/* ─── Main Graph Component ───────────────────────────────────────────────── */

export default function ReasoningGraph() {
  const {
    graphNodes: storeNodes,
    graphEdges: storeEdges,
    status,
    confidence,
    collisionPulseActive,
    activeCollision,
    thoughtCollisions,
  } = useAxiomStore();

  // Auto-layout with organic positioning
  const flowNodes: Node[] = useMemo(() => {
    const centerX = 400;
    const startY = 40;
    const ySpacing = 180;

    return storeNodes.map((n, i) => {
      const isCollision = n.type === "collision";
      // Collision nodes branch to the side
      let x = centerX;
      let y = i * ySpacing + startY;

      if (isCollision) {
        // Find parent node index
        const parentEdge = storeEdges.find((e) => e.target === n.id);
        if (parentEdge) {
          const parentIdx = storeNodes.findIndex((pn) => pn.id === parentEdge.source);
          if (parentIdx >= 0) {
            x = centerX + 350; // Branch to the right
            y = parentIdx * ySpacing + startY + 30;
          }
        }
      } else if (i > 0) {
        // Slight organic sway for non-collision nodes
        const sway = Math.sin(i * 1.2) * 60;
        x = centerX + sway;
      }

      return {
        id: n.id,
        type: "reasoning",
        position: { x, y },
        data: {
          label: n.label,
          nodeType: n.type,
          agent: n.agent,
          agentName: n.agent_name || "",
          confidence: n.confidence,
          color: n.color || "#00E5FF",
          importance: n.importance || 0.5,
          isContradiction: n.is_contradiction || false,
          pulseIntensity: n.pulse_intensity || 0.5,
          emotionalIntensity: n.emotional_intensity || 0.5,
        },
      };
    });
  }, [storeNodes, storeEdges]);

  const flowEdges: Edge[] = useMemo(() => {
    return storeEdges.map((e) => {
      const isCollision = e.is_collision || e.edge_type === "collision";
      const isChallenge = e.edge_type === "challenge";
      const strength = e.strength || 0.5;

      return {
        id: e.id,
        source: e.source,
        target: e.target,
        animated: e.animated,
        style: {
          stroke: isCollision
            ? "rgba(239, 68, 68, 0.5)"
            : isChallenge
            ? "rgba(245, 158, 11, 0.4)"
            : `rgba(0, 229, 255, ${0.15 + strength * 0.25})`,
          strokeWidth: isCollision ? 2.5 : 1 + strength * 1.5,
          strokeDasharray: isCollision ? "6 4" : undefined,
        },
        label: e.label,
        labelStyle: {
          fill: isCollision ? "#EF4444" : "#475569",
          fontSize: 8,
          fontFamily: "var(--font-geist-mono)",
          letterSpacing: "0.05em",
        },
        labelBgStyle: {
          fill: "rgba(5, 8, 22, 0.85)",
          fillOpacity: 0.85,
        },
      };
    });
  }, [storeEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [flowNodes, flowEdges, setNodes, setEdges]);

  const isEmpty = storeNodes.length === 0;
  const isReasoning = status === "reasoning";

  return (
    <div className="h-full w-full relative overflow-hidden">
      {/* ─── Collision Overlay Flash ──────────────────────────────── */}
      <AnimatePresence>
        {collisionPulseActive && (
          <motion.div
            key="collision-flash"
            className="absolute inset-0 z-20 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, times: [0, 0.15, 1] }}
            style={{
              background: "radial-gradient(circle at center, rgba(239,68,68,0.3) 0%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[#E2E8F0]">Neural Reasoning Graph</span>
          {isReasoning && (
            <motion.span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(0,229,255,0.08)",
                border: "1px solid rgba(0,229,255,0.15)",
                color: "#00E5FF",
              }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              EVOLVING
            </motion.span>
          )}
          {thoughtCollisions.length > 0 && (
            <motion.span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#EF4444",
              }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⚡ {thoughtCollisions.length} COLLISION{thoughtCollisions.length > 1 ? "S" : ""}
            </motion.span>
          )}
        </div>
        <div className="text-[10px] font-mono text-[#475569]">
          {storeNodes.length} nodes • {storeEdges.length} connections • {(confidence * 100).toFixed(0)}% conf
        </div>
      </div>

      {/* ─── Graph ──────────────────────────────────────────────────── */}
      {!isEmpty ? (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.4, maxZoom: 1.2 }}
          minZoom={0.2}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          className="!bg-transparent"
        >
          <Background gap={40} size={1} color="rgba(0, 229, 255, 0.025)" />
          <Controls showInteractive={false} className="!rounded-xl" />
        </ReactFlow>
      ) : (
        /* ─── Empty State — Animated Neural Constellation ─────── */
        <div className="flex items-center justify-center h-full">
          <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.svg
              width="160"
              height="160"
              viewBox="0 0 160 160"
              className="mx-auto mb-6"
            >
              {/* Concentric Rings */}
              {[25, 45, 65].map((r, i) => (
                <motion.circle
                  key={`ring-${i}`}
                  cx="80"
                  cy="80"
                  r={r}
                  fill="none"
                  stroke="rgba(0, 229, 255, 0.06)"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                  animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                  transition={{ duration: 20 + i * 10, repeat: Infinity, ease: "linear" }}
                  style={{ transformOrigin: "80px 80px" }}
                />
              ))}

              {/* Central Node */}
              <motion.circle
                cx="80"
                cy="80"
                r="6"
                fill="#00E5FF"
                animate={{
                  r: [6, 8, 6],
                  opacity: [0.5, 0.9, 0.5],
                  filter: [
                    "drop-shadow(0 0 4px rgba(0,229,255,0.3))",
                    "drop-shadow(0 0 12px rgba(0,229,255,0.6))",
                    "drop-shadow(0 0 4px rgba(0,229,255,0.3))",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              {/* Orbital Nodes */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                const colors = ["#00E5FF", "#3B82F6", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#6366F1", "#F472B6"];
                const rad = (angle * Math.PI) / 180;
                const radius = i % 2 === 0 ? 45 : 65;
                const x = 80 + Math.cos(rad) * radius;
                const y = 80 + Math.sin(rad) * radius;
                return (
                  <g key={i}>
                    <motion.line
                      x1="80"
                      y1="80"
                      x2={x}
                      y2={y}
                      stroke={`${colors[i]}30`}
                      strokeWidth="1"
                      animate={{ opacity: [0.1, 0.4, 0.1] }}
                      transition={{ duration: 2.5, delay: i * 0.25, repeat: Infinity }}
                    />
                    <motion.circle
                      cx={x}
                      cy={y}
                      r="3.5"
                      fill={`${colors[i]}50`}
                      animate={{
                        r: [3, 4.5, 3],
                        opacity: [0.3, 0.7, 0.3],
                      }}
                      transition={{ duration: 2, delay: i * 0.25, repeat: Infinity }}
                    />
                  </g>
                );
              })}
            </motion.svg>
            <p className="text-sm text-[#475569] mb-1">Neural Graph Awaiting Activation</p>
            <p className="text-[11px] text-[#334155]">
              Submit a query to visualize autonomous reasoning propagation
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0, 229, 255";
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}
