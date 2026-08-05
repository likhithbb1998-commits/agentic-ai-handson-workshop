"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { Snapshot } from "@/lib/types";

type WorkshopContextValue = {
  snapshot: Snapshot | null;
  loading: boolean;
  connected: boolean;
  error: string;
  refresh: () => Promise<void>;
  act: (payload: Record<string, unknown>) => Promise<{ ok: boolean; error?: string }>;
  runCode: (code: string) => Promise<{ stdout?: string; stderr?: string; status?: string; durationMs?: number; error?: string }>;
};

const WorkshopContext = createContext<WorkshopContextValue | null>(null);

export function WorkshopProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/workshop", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load the live workshop.");
      setSnapshot(await response.json());
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load the workshop.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void refresh());
    const socket: Socket = io({ transports: ["websocket", "polling"] });
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("WORKSHOP_UPDATED", () => void refresh());
    const fallback = window.setInterval(() => void refresh(), 5000);
    return () => { window.clearInterval(fallback); socket.disconnect(); };
  }, [refresh]);

  const act = useCallback(async (payload: Record<string, unknown>) => {
    const response = await fetch("/api/workshop", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, error: result.error || "Action failed." };
    await refresh(); return { ok: true };
  }, [refresh]);

  const runCode = useCallback(async (code: string) => {
    const response = await fetch("/api/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return { error: result.error || "Execution failed." };
    await refresh(); return result;
  }, [refresh]);

  const value = useMemo(() => ({ snapshot, loading, connected, error, refresh, act, runCode }), [snapshot, loading, connected, error, refresh, act, runCode]);
  return <WorkshopContext.Provider value={value}>{children}</WorkshopContext.Provider>;
}

export function useWorkshop() {
  const context = useContext(WorkshopContext);
  if (!context) throw new Error("useWorkshop must be used inside WorkshopProvider");
  return context;
}
