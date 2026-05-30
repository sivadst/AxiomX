/* ═══════════════════════════════════════════════════════════════════════════
   AXIOMX — WebSocket Hook
   Manages the real-time connection to the reasoning engine
   ═══════════════════════════════════════════════════════════════════════════ */

"use client";

import { useCallback, useRef, useEffect } from "react";
import { useAxiomStore } from "@/stores/axiomStore";
import type { WSEvent, ScenarioMode } from "@/types";

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export function useReasoningSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const { handleWSEvent, startReasoning } = useAxiomStore();

  const connect = useCallback(
    (sessionId: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }

      const ws = new WebSocket(`${WS_BASE_URL}/ws/reasoning/${sessionId}`);

      ws.onopen = () => {
        console.log("[AXIOMX] WebSocket connected:", sessionId);
      };

      ws.onmessage = (event) => {
        try {
          const data: WSEvent = JSON.parse(event.data);
          handleWSEvent(data);
        } catch (err) {
          console.error("[AXIOMX] Failed to parse WS message:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("[AXIOMX] WebSocket error:", err);
      };

      ws.onclose = () => {
        console.log("[AXIOMX] WebSocket closed:", sessionId);
      };

      wsRef.current = ws;
    },
    [handleWSEvent]
  );

  const startReasoningSession = useCallback(
    (query: string, scenarioMode: ScenarioMode) => {
      const sessionId = crypto.randomUUID();
      startReasoning(sessionId);
      connect(sessionId);

      // Wait for connection then send
      const interval = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          clearInterval(interval);
          wsRef.current.send(
            JSON.stringify({
              type: "start_reasoning",
              query,
              scenario_mode: scenarioMode,
            })
          );
        }
      }, 100);

      // Timeout after 5s
      setTimeout(() => clearInterval(interval), 5000);
    },
    [connect, startReasoning]
  );

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  return { startReasoningSession, disconnect };
}
