"use client";

import { useEffect, useState } from "react";

import type { ProviderUiStatus } from "@/hooks/useSettingsScreen";

const NONE: ProviderUiStatus = { source: "none", connected: false };

type Snapshot = {
  llm: ProviderUiStatus;
  tts: ProviderUiStatus;
};

/** Survives Chat ↔ Call remounts so the ready CTA never flashes first. */
let snapshot: Snapshot | null = null;
const listeners = new Set<(s: Snapshot) => void>();

export function rememberProviderStatus(llm: ProviderUiStatus, tts: ProviderUiStatus) {
  snapshot = { llm, tts };
  for (const listener of listeners) listener(snapshot);
}

export function rememberProviderStatusFromResponse(data: {
  llm?: ProviderUiStatus;
  tts?: ProviderUiStatus;
}) {
  rememberProviderStatus(data.llm ?? snapshot?.llm ?? NONE, data.tts ?? snapshot?.tts ?? NONE);
}

/** Matches Settings: a pasted per-user key, not a server env fallback. */
export function hasUserProviderKey(status: ProviderUiStatus | null): boolean {
  return status?.source === "user";
}

export function useProviderStatus() {
  const [llm, setLlm] = useState<ProviderUiStatus | null>(() => snapshot?.llm ?? null);
  const [tts, setTts] = useState<ProviderUiStatus | null>(() => snapshot?.tts ?? null);
  const [loaded, setLoaded] = useState(() => snapshot !== null);

  useEffect(() => {
    const onSnap = (s: Snapshot) => {
      setLlm(s.llm);
      setTts(s.tts);
      setLoaded(true);
    };
    listeners.add(onSnap);
    let cancelled = false;
    void fetch("/api/providers/status", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { llm?: ProviderUiStatus; tts?: ProviderUiStatus }) => {
        if (cancelled) return;
        rememberProviderStatusFromResponse(data);
      })
      .catch(() => {
        if (cancelled) return;
        rememberProviderStatus(NONE, NONE);
      });
    return () => {
      cancelled = true;
      listeners.delete(onSnap);
    };
  }, []);

  return {
    llm,
    tts,
    loaded,
    llmReady: hasUserProviderKey(llm),
    ttsReady: hasUserProviderKey(tts),
  };
}
