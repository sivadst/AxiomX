/* ═══════════════════════════════════════════════════════════════════════════
   AXIOMX — Neural Particle Background (CINEMATIC EDITION)
   Animated cosmic particle field that reacts dynamically to the 
   reasoning engine's state, thought collisions, and active agents.
   ═══════════════════════════════════════════════════════════════════════════ */

"use client";

import { useEffect, useRef } from "react";
import { useAxiomStore } from "@/stores/axiomStore";
import { AGENT_PROFILES } from "@/types";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  radius: number;
  opacity: number;
  color: string;
  pulsePhase: number;
  pulseSpeed: number;
}

// Convert hex to rgb string (e.g. "0, 229, 255")
function hexToRgbStr(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0, 229, 255";
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

export default function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animFrameRef = useRef<number>(0);

  // Subscribe to system state to react cinematically
  const { status, activeAgent, collisionPulseActive } = useAxiomStore();
  const isReasoning = status === "reasoning";

  // Use refs for state that updates rapidly to avoid react re-renders
  const stateRef = useRef({
    isReasoning,
    activeAgent,
    collisionPulseActive,
  });

  useEffect(() => {
    stateRef.current = { isReasoning, activeAgent, collisionPulseActive };
  }, [isReasoning, activeAgent, collisionPulseActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const PARTICLE_COUNT = Math.min(100, Math.floor((width * height) / 12000));
    const BASE_CONNECTION_DISTANCE = 180;
    const MOUSE_RADIUS = 250;

    // Default colors when idle
    const IDLE_COLORS = [
      "0, 229, 255",   // cyan
      "59, 130, 246",  // blue
      "139, 92, 246",  // purple
      "99, 102, 241",  // indigo
    ];

    // Create particles
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => {
      const vx = (Math.random() - 0.5) * 0.4;
      const vy = (Math.random() - 0.5) * 0.4;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx,
        vy,
        baseVx: vx,
        baseVy: vy,
        radius: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: IDLE_COLORS[Math.floor(Math.random() * IDLE_COLORS.length)],
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.02,
      };
    });

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    let globalTime = 0;

    const animate = () => {
      globalTime += 0.01;
      // Fade out previous frame instead of clear for motion blur effect
      ctx.fillStyle = "rgba(5, 8, 22, 0.25)";
      ctx.fillRect(0, 0, width, height);

      const currentState = stateRef.current;
      
      // Determine dynamic parameters
      let speedMultiplier = currentState.isReasoning ? 2.5 : 1;
      let connectionDistance = BASE_CONNECTION_DISTANCE;
      let lineColor = "rgba(0, 229, 255, OPA)";
      
      if (currentState.collisionPulseActive) {
        speedMultiplier = 8; // High turbulence
        connectionDistance = BASE_CONNECTION_DISTANCE * 1.5;
        lineColor = "rgba(239, 68, 68, OPA)"; // Red flash
      } else if (currentState.activeAgent) {
        const agentColor = AGENT_PROFILES[currentState.activeAgent].color;
        lineColor = `rgba(${hexToRgbStr(agentColor)}, OPA)`;
      }

      // Update and draw particles
      for (const p of particles) {
        // Add turbulence if collision is active
        if (currentState.collisionPulseActive) {
          p.vx += (Math.random() - 0.5) * 1.5;
          p.vy += (Math.random() - 0.5) * 1.5;
        } else {
          // Slowly return to base velocities
          p.vx = p.vx * 0.95 + (p.baseVx * speedMultiplier) * 0.05;
          p.vy = p.vy * 0.95 + (p.baseVy * speedMultiplier) * 0.05;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.pulsePhase += p.pulseSpeed * speedMultiplier;

        // Wrap around smoothly
        if (p.x < -50) p.x = width + 50;
        if (p.x > width + 50) p.x = -50;
        if (p.y < -50) p.y = height + 50;
        if (p.y > height + 50) p.y = -50;

        // Mouse interaction (repulsion/attraction)
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);
        
        if (dist < MOUSE_RADIUS) {
          // If reasoning, mouse attracts slightly (gravitational pull)
          // If idle, mouse repels
          const forceDirection = currentState.isReasoning ? -1 : 1;
          const force = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * forceDirection;
          p.vx += (dx / dist) * force * 0.05;
          p.vy += (dy / dist) * force * 0.05;
        }

        // Apply friction to max speed
        const maxSpeed = 5 * speedMultiplier;
        const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (currentSpeed > maxSpeed) {
          p.vx = (p.vx / currentSpeed) * maxSpeed;
          p.vy = (p.vy / currentSpeed) * maxSpeed;
        }

        // Pulse effect
        const pulse = Math.sin(p.pulsePhase) * 0.4 + 0.6;
        
        // Dynamic particle color based on agent state
        let pColor = p.color;
        if (currentState.collisionPulseActive) {
          pColor = "239, 68, 68"; // Red
        } else if (currentState.activeAgent && Math.random() > 0.5) {
           pColor = hexToRgbStr(AGENT_PROFILES[currentState.activeAgent].color);
        }

        // Draw particle core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * pulse * (currentState.isReasoning ? 1.5 : 1), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pColor}, ${p.opacity * pulse * (currentState.collisionPulseActive ? 2 : 1)})`;
        ctx.fill();

        // Draw particle glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 4 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pColor}, ${p.opacity * 0.15 * pulse})`;
        ctx.fill();
      }

      // Draw neural connections
      ctx.lineWidth = currentState.collisionPulseActive ? 1.5 : 0.8;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connectionDistance * connectionDistance) {
            const dist = Math.sqrt(distSq);
            let opacity = (1 - dist / connectionDistance);
            
            // Pulse the lines based on global time
            opacity *= (Math.sin(globalTime * 5 + i * 0.1) * 0.3 + 0.7);
            
            if (currentState.isReasoning) opacity *= 1.5;
            if (currentState.collisionPulseActive) opacity *= 2;

            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            
            // If collision, draw jagged lightning-like lines
            if (currentState.collisionPulseActive && Math.random() > 0.7) {
              const midX = (particles[i].x + particles[j].x) / 2 + (Math.random() - 0.5) * 20;
              const midY = (particles[i].y + particles[j].y) / 2 + (Math.random() - 0.5) * 20;
              ctx.lineTo(midX, midY);
            }
            
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = lineColor.replace("OPA", opacity.toString());
            ctx.stroke();
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none mix-blend-screen"
      style={{ opacity: 0.8 }}
    />
  );
}
