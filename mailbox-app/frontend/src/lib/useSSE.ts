"use client";
import { useEffect } from "react";
import { API_BASE } from "./api";

export function useSSE(local: string | undefined, onEvent: (e: any) => void) {
  useEffect(() => {
    if (!local) return;
    const url = `${API_BASE}/stream/${encodeURIComponent(local)}`;
    const es = new EventSource(url);
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        onEvent(data);
      } catch {}
    };
    es.onerror = () => {
      // Auto-reconnect by closing and letting effect re-run on remount
      es.close();
    };
    return () => es.close();
  }, [local, onEvent]);
}
