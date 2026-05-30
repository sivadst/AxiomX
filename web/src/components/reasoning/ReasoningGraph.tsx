/* ═══════════════════════════════════════════════════════════════════════════
   AXIOMX — Interactive Reasoning Graph
   THE SIGNATURE FEATURE — A cinematic visualization of thought chains
   ═══════════════════════════════════════════════════════════════════════════ */

"use client";

import { useMemo, useCallback } from "react";
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
import { useEffect } from "react";

/* ─── Custom Node Component ──────────────────────────────────────────────── */

function ReasoningNode({ data }: NodeProps) {
  const isQuery = data.type === "query";
  const color = (data.color as string) || "#00E5FF";
  const confidence = (data.confidence as number) || 0;
  const agentName = (data.agentName as string) || "";

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 15, stiffness: 200 }}
      className="relative group"
    >
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-3 !h-3" />

      {/* Glow Ring */}
      <motion.div
        className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
        }}
        animate={{
          boxShadow: [
            `0 0 15px ${color}10`,
            `0 0 30px ${color}20`,
            `0 0 15px ${color}10`,
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Node Body */}
      <div
        className="relative px-5 py-3.5 rounded-xl min-w-[200px] max-w-[280px] cursor-pointer transition-all duration-300"
        style={{
          background: isQuery
            ? "rgba(0,229,255,0.06)"
            : `rgba(${hexToRgb(color)}, 0.05)`,
          border: `1px solid ${isQuery ? "rgba(0,229,255,0.2)" : `${color}30`}`,
          boxShadow: `0 0 20px ${color}08`,
        }}
      >
        {/* Agent Badge */}
        {!isQuery && (
          <div className="flex items-center gap-2 mb-2">
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ background: color, boxShadow: `0 0 6px ${color}` }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-[10px] font-mono font-bold tracking-widest" style={{ color }}>
              {agentName}
            </span>
            <span className="ml-auto text-[10px] font-mono" style={{ color: `${color}AA` }}>
              {(confidence * 100).toFixed(0)}%
            </span>
          </div>
        )}

        {/* Label */}
        <p
          className={`text-[11px] leading-relaxed ${isQuery ? "text-[#00E5FF] font-medium" : "text-[#94A3B8]"}`}
          style={{ fontFamily: isQuery ? undefined : "var(--font-geist-mono)" }}
        >
          {isQuery ? "📡 " : ""}
          {data.label as string}
        </p>

        {/* Confidence Bar */}
        {!isQuery && (
          <div className="mt-2 h-0.5 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: color }}
              initial={{ width: 0 }}
              animate={{ width: `${confidence * 100}%` }}
              transition={{ delay: 0.5, type: "spring" }}
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
  const { graphNodes: storeNodes, graphEdges: storeEdges, status, confidence } = useAxiomStore();

  // Convert store data to React Flow format with auto-layout
  const flowNodes: Node[] = useMemo(() => {
    return storeNodes.map((n, i) => ({
      id: n.id,
      type: "reasoning",
      position: {
        x: 300 + Math.sin(i * 0.8) * 150,
        y: i * 160,
      },
      data: {
        label: n.label,
        type: n.type,
        agent: n.agent,
        agentName: n.agent_name || "",
        confidence: n.confidence,
        color: n.color || "#00E5FF",
      },
    }));
  }, [storeNodes]);

  const flowEdges: Edge[] = useMemo(() => {
    return storeEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      animated: e.animated,
      style: {
        stroke: "rgba(0, 229, 255, 0.3)",
        strokeWidth: 2,
      },
      label: e.label,
      labelStyle: {
        fill: "#475569",
        fontSize: 9,
        fontFamily: "var(--font-geist-mono)",
      },
      labelBgStyle: {
        fill: "rgba(5, 8, 22, 0.8)",
        fillOpacity: 0.8,
      },
    }));
  }, [storeEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [flowNodes, flowEdges, setNodes, setEdges]);

  const isEmpty = storeNodes.length === 0;

  return (
    <div className="h-full w-full relative">
      {/* ─── Header Overlay ─────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[#E2E8F0]">Reasoning Graph</span>
          {status === "reasoning" && (
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
        </div>
        <div className="text-[10px] font-mono text-[#475569]">
          {storeNodes.length} nodes • {storeEdges.length} connections
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
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.3}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          className="!bg-transparent"
        >
          <Background
            gap={40}
            size={1}
            color="rgba(0, 229, 255, 0.03)"
          />
          <Controls
            showInteractive={false}
            className="!rounded-xl"
          />
        </ReactFlow>
      ) : (
        <div className="flex items-center justify-center h-full">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Animated Neural Icon */}
            <motion.svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              className="mx-auto mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {/* Central Node */}
              <motion.circle
                cx="60"
                cy="60"
                r="8"
                fill="#00E5FF"
                opacity={0.4}
                animate={{ r: [8, 10, 8], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              {/* Orbital Nodes */}
              {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                const x = 60 + Math.cos(rad) * 35;
                const y = 60 + Math.sin(rad) * 35;
                return (
                  <g key={i}>
                    <motion.line
                      x1="60"
                      y1="60"
                      x2={x}
                      y2={y}
                      stroke="rgba(0, 229, 255, 0.15)"
                      strokeWidth="1"
                      animate={{ opacity: [0.1, 0.3, 0.1] }}
                      transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                    />
                    <motion.circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill="rgba(0, 229, 255, 0.3)"
                      animate={{ r: [3, 5, 3], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                    />
                  </g>
                );
              })}
            </motion.svg>
            <p className="text-sm text-[#475569] mb-1">Neural Graph Inactive</p>
            <p className="text-[11px] text-[#334155]">
              Start a reasoning session to visualize thought propagation
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
