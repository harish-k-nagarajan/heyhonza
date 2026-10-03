"use client";

import type { ChatSessionMeta, ContextChunk, ContextSource } from "@/types";
import type { ProfilePatch } from "@/lib/server/user-data";

/**
 * Client bridge to the per-user DB (`/api/state`). One rule keeps local dev and
 * production honest: `dbMode` is only true when the server confirmed a signed-in
 * user (`persisted`). Until then every write is a no-op and the Zustand stores
 * (localStorage-backed) are the source of truth — so the app runs with no auth
 * locally, and switches to per-user DB persistence the moment Supabase + a real
 * session exist, with no page-level branching.
 */

let dbMode = false;
export function isDbMode(): boolean {
  return dbMode;
}

export type ServerState = {
  persisted: boolean;
  userId?: string;
  profile?: {
    name: string | null;
    fullName?: string | null;
    level: string;
    topics: string[];
    preferredModel: string | null;
    onboardingCompleted: boolean;
    onboardingStep?: number;
    formality?: "ty" | "vy";
    scheduleEnabled?: boolean;
    dailyMessageCount?: 1 | 2 | 3;
    scheduleMode?: "specific" | "random";
    firstMessageTime?: string;
    timezone?: string | null;
    focusTopic?: string | null;
    recentTopics?: string[];
    lastOpeners?: string[];
  };
  contextChunks?: ContextChunk[];
  activeSessionId?: string | null;
  endedSessions?: ChatSessionMeta[];
  messages?: {
    id: string;
    role: "user" | "assistant";
    content: string;
    kind: "chat" | "call";
    sessionId?: string;
    createdAt: number;
  }[];
};

/** GET the signed-in user's full state. Sets dbMode from the server's answer. */
export async function fetchServerState(): Promise<ServerState> {
  try {
    const res = await fetch("/api/state", { cache: "no-store" });
    const data = (await res.json()) as ServerState;
    dbMode = Boolean(data.persisted);
    return data;
  } catch {
    dbMode = false;
    return { persisted: false };
  }
}

type StatePatch = {
  profile?: ProfilePatch;
  addContext?: { text: string; meta: ContextSource };
  upsertContext?: { text: string; meta: ContextSource };
  removeContextId?: string;
  reset?: boolean;
};

/** Apply a patch server-side. No-op (resolves false) when not in dbMode. */
export async function patchServerState(
  patch: StatePatch,
): Promise<{ persisted: boolean; added?: { id: string; syncedAt: number } }> {
  if (!dbMode) {
    await fetchServerState();
  }
  if (!dbMode) return { persisted: false };
  try {
    const res = await fetch("/api/state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    return (await res.json()) as { persisted: boolean; added?: { id: string; syncedAt: number } };
  } catch {
    return { persisted: false };
  }
}
