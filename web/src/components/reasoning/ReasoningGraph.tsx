/* ═══════════════════════════════════════════════════════════════════════════
   AXIOMX — Interactive Reasoning Graph v3.0 (COGNITIVE PHYSICS ENGINE)
   ═══════════════════════════════════════════════════════════════════════════
   
   THE SIGNATURE FEATURE — Live Autonomous Cognition.
   
   This is no longer a static flowchart. It is a living intelligence system
   driven by a real-time cognitive physics simulation.
   
   Features implemented:
   1. Dynamic Graph Mutation & Cognitive Gravity:
      - High confidence logic acts as gravitational anchors (centralizing).
      - Low confidence branches drift to the periphery.
      - Graph fluidly reorganizes on every frame using spring/repulsion physics.
   2. Thought Collision Systems:
      - Contradiction shockwaves destabilize the graph (turbulence injection).
      - Red neural pulses and fragmented edges during disagreements.
   3. Live Intelligence Streaming & Holographic Depth:
      - Flowing data packets along edges (CSS animated stroke-dashoffset).
      - Nodes scale and glow dynamically based on real-time confidence.
      - Cinematic ambient particles overlay.
   ═══════════════════════════════════════════════════════════════════════════ */

"use client";

import { useMemo, useEffect, useRef, useCallback, useState } from "react";
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
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAxiomStore } from "@/stores/axiomStore";

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
  const hasCollisionPulse = data.globalCollisionActive as boolean;

  // Cinematic scaling and fading
  const scale = 0.8 + importance * 0.4;
  const maxWidth = isQuery ? 320 : isCollisionNode ? 280 : 300;
  const opacity = Math.max(0.3, importance);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, rotateX: 45, y: 50 }}
      animate={{
        scale: 1,
        opacity: opacity,
        rotateX: 0,
        y: 0,
        // Holographic floating effect
        z: importance * 50,
      }}
      transition={{
        type: "spring",
        damping: isCollisionNode ? 8 : 15,
        stiffness: isCollisionNode ? 350 : 200,
      }}
      className="relative group"
      style={{
        transform: `scale(${scale})`,
        perspective: "1000px",
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-3 !h-3" />

      {/* Ambient Neural Glow Ring */}
      <motion.div
        className="absolute -inset-4 rounded-[2rem] pointer-events-none"
        style={{
          background: isCollisionNode
            ? `radial-gradient(circle, rgba(239,68,68,0.2) 0%, transparent 70%)`
            : `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
        }}
        animate={{
          opacity: [0.2, 0.5 + emotionalIntensity * 0.5, 0.2],
          scale: [1, 1 + pulseIntensity * 0.15, 1],
        }}
        transition={{
          duration: 1.5 + (1 - emotionalIntensity) * 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Contradiction Shockwave */}
      {isContradiction && (
        <motion.div
          className="absolute -inset-8 rounded-full pointer-events-none"
          style={{
            border: `2px solid ${isCollisionNode ? "rgba(239,68,68,0.4)" : `${color}40`}`,
            boxShadow: `0 0 20px ${isCollisionNode ? "rgba(239,68,68,0.3)" : `${color}20`}`,
          }}
          initial={{ scale: 0.2, opacity: 1 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
        />
      )}

      {/* Node Holographic Body */}
      <div
        className="relative rounded-xl cursor-pointer transition-all duration-300 backdrop-blur-md"
        style={{
          width: maxWidth,
          padding: isQuery ? "18px 22px" : "14px 18px",
          background: isCollisionNode
            ? "rgba(30, 10, 10, 0.6)" // Deeper red-tinted glass
            : isQuery
            ? "rgba(5, 20, 30, 0.6)"
            : `rgba(5, 8, 22, 0.7)`,
          border: isCollisionNode
            ? "1px solid rgba(239, 68, 68, 0.4)"
            : `1px solid ${isQuery ? "rgba(0,229,255,0.3)" : `${color}25`}`,
          boxShadow: isCollisionNode
            ? "0 10px 40px rgba(239,68,68,0.15), inset 0 1px 0 rgba(239,68,68,0.3)"
            : `0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 ${color}20`,
          // Jitter during active system collisions
          transform: hasCollisionPulse ? `translate(${Math.random()*4-2}px, ${Math.random()*4-2}px)` : 'none',
        }}
      >
        {/* Agent Identity Header */}
        {!isQuery && (
          <div className="flex items-center gap-2 mb-3">
            {/* Cognitive Pulse Dot */}
            <motion.div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                background: isCollisionNode ? "#EF4444" : color,
                boxShadow: `0 0 ${8 + pulseIntensity * 10}px ${isCollisionNode ? "#EF4444" : color}`,
              }}
              animate={{
                scale: [1, 1 + pulseIntensity * 0.8, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 0.8 + (1 - emotionalIntensity),
                repeat: Infinity,
              }}
            />
            <span
              className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase"
              style={{
                color: isCollisionNode ? "#EF4444" : color,
                textShadow: `0 0 10px ${isCollisionNode ? "rgba(239,68,68,0.5)" : `${color}50`}`,
              }}
            >
              {agentName}
            </span>
            
            {/* Badges */}
            <div className="ml-auto flex items-center gap-2">
              {isCollisionNode && (
                <motion.span
                  className="text-[8px] px-1.5 py-0.5 rounded-sm font-bold tracking-widest"
                  style={{
                    background: "rgba(239,68,68,0.15)",
                    color: "#EF4444",
                    border: "1px solid rgba(239,68,68,0.3)",
                  }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  INSTABILITY
                </motion.span>
              )}
              {!isCollisionNode && (
                <span className="text-[9px] font-mono" style={{ color: `${color}AA` }}>
                  {(confidence * 100).toFixed(0)}%
                </span>
              )}
            </div>
          </div>
        )}

        {/* Thought Content */}
        <p
          className={`text-[11px] leading-relaxed tracking-wide ${
            isQuery ? "text-[#00E5FF] font-medium" : isCollisionNode ? "text-[#FCA5A5]" : "text-[#94A3B8]"
          }`}
          style={{
            fontFamily: isQuery ? undefined : "var(--font-geist-mono)",
            display: "-webkit-box",
            WebkitLineClamp: isQuery ? 3 : 5,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textShadow: isQuery ? "0 0 10px rgba(0,229,255,0.3)" : "none",
          }}
        >
          {isQuery ? "📡 QUERY DETECTED: " : isCollisionNode ? "⚠️ CONTRADICTION: " : ""}
          {data.label as string}
        </p>

        {/* Dynamic Confidence & Severity Bars */}
        {!isQuery && !isCollisionNode && (
          <div className="mt-3 h-[2px] bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden relative">
            <motion.div
              className="absolute top-0 left-0 bottom-0 rounded-full"
              style={{
                background: `linear-gradient(90deg, transparent, ${color})`,
                boxShadow: `0 0 8px ${color}80`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${confidence * 100}%` }}
              transition={{ delay: 0.2, type: "spring", damping: 15 }}
            />
          </div>
        )}

        {isCollisionNode && (
          <div className="mt-3 h-[2px] bg-[rgba(239,68,68,0.1)] rounded-full overflow-hidden relative">
            <motion.div
              className="absolute top-0 left-0 bottom-0 rounded-full"
              style={{
                background: "linear-gradient(90deg, transparent, #EF4444)",
                boxShadow: "0 0 8px rgba(239,68,68,0.8)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${(1 - confidence) * 100}%` }}
              transition={{ delay: 0.2, type: "spring" }}
            />
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-3 !h-3" />
    </motion.div>
  );
}

const nodeTypes = { reasoning: ReasoningNode };

/* ─── Cognitive Physics Engine ───────────────────────────────────────────── */

// This hook runs a real-time force simulation to make the graph feel ALIVE.
function useCognitivePhysics(
  storeNodes: any[],
  storeEdges: any[],
  collisionPulseActive: boolean,
  globalConfidence: number
) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const velocities = useRef<Record<string, { vx: number; vy: number }>>({});
  const positions = useRef<Record<string, { x: number; y: number }>>({});
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // 1. Sync React Flow data models with store data
    const newEdges: Edge[] = storeEdges.map((e) => {
      const isCollision = e.is_collision || e.edge_type === "collision";
      const isChallenge = e.edge_type === "challenge";
      const strength = e.strength || 0.5;

      return {
        id: e.id,
        source: e.source,
        target: e.target,
        animated: true,
        // Cinematic Edge Styles
        style: {
          stroke: isCollision
            ? "rgba(239, 68, 68, 0.8)"
            : isChallenge
            ? "rgba(245, 158, 11, 0.6)"
            : `rgba(0, 229, 255, ${0.2 + strength * 0.4})`,
          strokeWidth: isCollision ? 3 : 1.5 + strength * 2,
          // Fragmented edges for collisions
          strokeDasharray: isCollision ? "4 8" : undefined,
          filter: isCollision 
            ? "drop-shadow(0 0 5px rgba(239,68,68,0.5))" 
            : `drop-shadow(0 0 3px rgba(0,229,255,${strength * 0.5}))`,
        },
        label: e.label,
        labelStyle: {
          fill: isCollision ? "#FCA5A5" : "#94A3B8",
          fontSize: 9,
          fontFamily: "var(--font-geist-mono)",
          letterSpacing: "0.1em",
        },
        labelBgStyle: {
          fill: "rgba(5, 8, 22, 0.9)",
          fillOpacity: 0.9,
          stroke: isCollision ? "rgba(239,68,68,0.3)" : "rgba(0,229,255,0.1)",
          strokeWidth: 1,
          rx: 4,
        },
      };
    });
    setEdges(newEdges);

    // Initialize physics bodies for new nodes
    storeNodes.forEach((n, i) => {
      if (!positions.current[n.id]) {
        // Spawn near parent or center
        const parentEdge = storeEdges.find((e) => e.target === n.id);
        let startX = window.innerWidth / 2;
        let startY = 100;

        if (parentEdge && positions.current[parentEdge.source]) {
          const p = positions.current[parentEdge.source];
          startX = p.x + (Math.random() * 100 - 50);
          startY = p.y + 150 + (Math.random() * 50);
        } else {
          startY = i * 150 + 50;
        }

        positions.current[n.id] = { x: startX, y: startY };
        velocities.current[n.id] = { vx: 0, vy: 0 };
      }
    });

    // 2. Physics Simulation Loop
    const simulate = () => {
      const kRepel = 80000;      // Repulsion force constant
      const kAttract = 0.02;     // Spring constant for edges
      const damping = 0.75;      // Friction
      const targetYSpacing = 200; // Optimal vertical distance between connected nodes

      const forces: Record<string, { fx: number; fy: number }> = {};
      storeNodes.forEach((n) => (forces[n.id] = { fx: 0, fy: 0 }));

      // A. Repulsive forces between ALL nodes
      for (let i = 0; i < storeNodes.length; i++) {
        for (let j = i + 1; j < storeNodes.length; j++) {
          const n1 = storeNodes[i];
          const n2 = storeNodes[j];
          const p1 = positions.current[n1.id];
          const p2 = positions.current[n2.id];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);

          // Force inversely proportional to square of distance
          if (dist < 800) {
            const force = kRepel / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            forces[n1.id].fx += fx;
            forces[n1.id].fy += fy;
            forces[n2.id].fx -= fx;
            forces[n2.id].fy -= fy;
          }
        }
      }

      // B. Attractive forces along edges (Springs)
      storeEdges.forEach((e) => {
        const p1 = positions.current[e.source];
        const p2 = positions.current[e.target];
        if (!p1 || !p2) return;

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        
        // Pull x coordinates together (vertical alignment)
        forces[e.source].fx += dx * kAttract;
        forces[e.target].fx -= dx * kAttract;

        // Maintain specific Y distance
        const yDiff = dy - targetYSpacing;
        forces[e.source].fy += yDiff * kAttract;
        forces[e.target].fy -= yDiff * kAttract;
      });

      // C. Cognitive Gravity & Turbulence
      const centerX = window.innerWidth / 2;
      
      storeNodes.forEach((n, i) => {
        const p = positions.current[n.id];
        const importance = n.importance || 0.5;
        const isCollision = n.type === "collision";

        // 1. Cognitive Gravity: High importance nodes are pulled to the center X axis.
        // Low importance nodes drift outward.
        const gravityX = (centerX - p.x) * 0.005 * importance;
        forces[n.id].fx += gravityX;

        // Collision branches are deliberately pushed to the side
        if (isCollision) {
          forces[n.id].fx += (p.x > centerX ? 10 : -10); // Push outwards
        }

        // 2. Root anchor (Query)
        if (n.type === "query") {
          forces[n.id].fx += (centerX - p.x) * 0.1; // Strong pull to center
          forces[n.id].fy += (80 - p.y) * 0.1;      // Anchor to top
        }

        // 3. Thought Collision Turbulence
        // When agents disagree, inject chaotic noise into the network
        if (collisionPulseActive) {
          forces[n.id].fx += (Math.random() - 0.5) * 40;
          forces[n.id].fy += (Math.random() - 0.5) * 20;
        }

        // Apply forces to velocity
        const v = velocities.current[n.id];
        v.vx = (v.vx + forces[n.id].fx) * damping;
        v.vy = (v.vy + forces[n.id].fy) * damping;

        // Apply velocity to position
        p.x += v.vx;
        p.y += v.vy;
      });

      // 3. Map to React Flow Nodes
      const nextNodes = storeNodes.map((n) => ({
        id: n.id,
        type: "reasoning",
        position: { x: positions.current[n.id].x, y: positions.current[n.id].y },
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
          globalCollisionActive: collisionPulseActive, // Pass global state down
        },
      }));

      setNodes(nextNodes);
      rafRef.current = requestAnimationFrame(simulate);
    };

    if (storeNodes.length > 0) {
      rafRef.current = requestAnimationFrame(simulate);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [storeNodes, storeEdges, collisionPulseActive, globalConfidence]);

  return { nodes, edges, onNodesChange: setNodes, onEdgesChange: setEdges };
}

/* ─── Main Graph Component Wrapper ───────────────────────────────────────── */

function GraphCore() {
  const {
    graphNodes: storeNodes,
    graphEdges: storeEdges,
    status,
    confidence,
    collisionPulseActive,
    thoughtCollisions,
  } = useAxiomStore();

  const { nodes, edges, onNodesChange, onEdgesChange } = useCognitivePhysics(
    storeNodes,
    storeEdges,
    collisionPulseActive,
    confidence
  );
  
  const reactFlowInstance = useReactFlow();

  // Auto-center camera
  useEffect(() => {
    if (nodes.length > 0) {
      reactFlowInstance.fitView({ padding: 0.3, duration: 800, maxZoom: 1.2 });
    }
  }, [nodes.length, reactFlowInstance]);

  const isEmpty = storeNodes.length === 0;
  const isReasoning = status === "reasoning";

  return (
    <div className="h-full w-full relative overflow-hidden bg-transparent">
      {/* ─── Ambient Neural Particles (Background) ──────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        {/* Simple CSS animated floating particles to add holographic depth */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 1 + "px",
              height: Math.random() * 3 + 1 + "px",
              background: "#00E5FF",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              boxShadow: "0 0 10px #00E5FF",
            }}
            animate={{
              y: [0, -100 - Math.random() * 100],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* ─── Collision Shockwave Flash ──────────────────────────── */}
      <AnimatePresence>
        {collisionPulseActive && (
          <motion.div
            key="collision-flash"
            className="absolute inset-0 z-20 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, times: [0, 0.1, 1] }}
            style={{
              background: "radial-gradient(circle at center, rgba(239,68,68,0.4) 0%, transparent 80%)",
              mixBlendMode: "screen",
            }}
          />
        )}
      </AnimatePresence>

      {/* ─── Overlay Header ───────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4 pointer-events-none">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-bold text-white tracking-[0.1em] drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]">
            NEURAL REASONING TOPOLOGY
          </h2>
          {isReasoning && (
            <motion.div
              className="flex items-center gap-2 px-3 py-1 rounded-sm backdrop-blur-md"
              style={{
                background: "rgba(0,229,255,0.1)",
                border: "1px solid rgba(0,229,255,0.2)",
              }}
              animate={{
                boxShadow: [
                  "0 0 10px rgba(0,229,255,0.1)",
                  "0 0 20px rgba(0,229,255,0.3)",
                  "0 0 10px rgba(0,229,255,0.1)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-pulse" />
              <span className="text-[9px] font-mono text-[#00E5FF] tracking-widest">LIVE COGNITION</span>
            </motion.div>
          )}
          {thoughtCollisions.length > 0 && (
            <motion.div
              className="px-3 py-1 rounded-sm backdrop-blur-md text-[9px] font-mono tracking-widest"
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#FCA5A5",
                textShadow: "0 0 5px rgba(239,68,68,0.5)",
              }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ⚠ {thoughtCollisions.length} INSTABILITIES DETECTED
            </motion.div>
          )}
        </div>
        
        {/* Global Confidence Metric */}
        <div className="flex items-center gap-3 bg-[rgba(5,8,22,0.8)] backdrop-blur-md px-4 py-1.5 rounded-lg border border-[rgba(0,229,255,0.1)]">
          <span className="text-[9px] font-mono text-[#64748B] uppercase tracking-wider">System Confidence</span>
          <div className="w-16 h-1 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#00E5FF]"
              style={{ boxShadow: "0 0 10px #00E5FF" }}
              animate={{ width: `${confidence * 100}%` }}
              transition={{ type: "spring", damping: 20 }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-white">{(confidence * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* ─── Graph Canvas ─────────────────────────────────────────── */}
      {!isEmpty ? (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange as any}
          onEdgesChange={onEdgesChange as any}
          nodeTypes={nodeTypes}
          minZoom={0.1}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
          className="!bg-transparent z-10"
        >
          {/* Neural Network Grid Background */}
          <Background 
            gap={60} 
            size={1.5} 
            color="rgba(0, 229, 255, 0.05)" 
            style={{
              background: "radial-gradient(circle at center, rgba(5,8,22,0) 0%, rgba(5,8,22,1) 100%)",
            }}
          />
        </ReactFlow>
      ) : (
        /* ─── Empty State — Awaiting Uplink ─────────────────────── */
        <div className="flex items-center justify-center h-full z-10 relative">
          <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            {/* Abstract Cognitive Core SVG */}
            <motion.svg width="200" height="200" viewBox="0 0 200 200" className="mx-auto mb-8">
              {/* Spinning geometric rings to look like a futuristic computation core */}
              {[40, 60, 80].map((r, i) => (
                <motion.g key={i} animate={{ rotate: i % 2 === 0 ? 360 : -360 }} transition={{ duration: 15 + i * 5, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "100px 100px" }}>
                  <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(0, 229, 255, 0.1)" strokeWidth="1" strokeDasharray={`${Math.PI * r / 4} ${Math.PI * r / 8}`} />
                  <circle cx="100" cy="100" r={r + 2} fill="none" stroke="rgba(0, 229, 255, 0.05)" strokeWidth="0.5" />
                </motion.g>
              ))}
              
              {/* Central Processor */}
              <motion.path 
                d="M 100 85 L 115 100 L 100 115 L 85 100 Z" 
                fill="none" 
                stroke="#00E5FF" 
                strokeWidth="2"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: "drop-shadow(0 0 10px rgba(0,229,255,0.8))" }}
              />
            </motion.svg>
            <h3 className="text-sm font-bold text-white tracking-[0.3em] mb-2 drop-shadow-md">AWAITING COGNITIVE UPLINK</h3>
            <p className="text-[10px] text-[#475569] font-mono tracking-widest uppercase">
              Standby for multi-agent reasoning deployment
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function ReasoningGraph() {
  return (
    <ReactFlowProvider>
      <GraphCore />
    </ReactFlowProvider>
  );
}
