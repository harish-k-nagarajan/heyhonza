"use client";

import { CHAT_SESSION_MAX_MESSAGES } from "@/lib/constants";
import { buildLearnerContextText, DOC_CACHE_MS } from "@/lib/context";
import {
  clearReplyChoreography,
  scheduleAssistantReveal,
} from "@/hooks/useReplyChoreography";
import {
  previewFromThread,
  useChatStore,
  type IncomingOpen,
} from "@/stores/useChatStore";
import { useMoodStore } from "@/stores/useMoodStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { isDbMode } from "@/lib/client/state-sync";
import { upsertContext } from "@/lib/client/context-actions";
import { asTopicIds } from "@/lib/topic-focus";
import type { ChatSessionMeta, MessageKind } from "@/types";

/**
 * The single client path to Honza. Chat calls these to talk to `/api/chat`,
 * update the shared chat store, and drive Honza's shared mood.
 */

/** In-flight local→server session swap. Sends wait so the turn uses the real id. */
let sessionReady: Promise<string> | null = null;

function threadMessages() {
  return useChatStore
    .getState()
    .messages.filter((m) => m.role === "user" || m.role === "assistant");
}

/** True when the learner has started a typed chat and has not ended it. */
export function isTypedChatActive(): boolean {
  const { chatPhase, activeSessionId } = useChatStore.getState();
  return chatPhase === "active" && Boolean(activeSessionId);
}

async function refreshLocalGoogleDocIfStale(): Promise<void> {
  if (isDbMode()) return;
  const chunks = useSettingsStore.getState().contextChunks;
  const doc = chunks.find((c) => c.meta.kind === "google_doc");
  if (!doc || doc.meta.kind !== "google_doc" || !doc.meta.url) return;
  if (Date.now() - doc.meta.addedAt < DOC_CACHE_MS) return;
  const url = doc.meta.url;
  try {
    const res = await fetch("/api/context/google-doc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = (await res.json()) as { text?: string };
    if (res.ok && data.text) {
      await upsertContext(data.text, {
        kind: "google_doc",
        url,
        addedAt: Date.now(),
      });
    }
  } catch {
    // Keep the last snapshot if the live export fails.
  }
}

function applyEngineFocus(data: {
  focusTopic?: string | null;
  recentTopics?: string[];
  lastOpeners?: string[];
}): void {
  if (!data.recentTopics && data.focusTopic === undefined && !data.lastOpeners) {
    return;
  }
  useSettingsStore.getState().setEngineFocus({
    focusTopic: asTopicIds(data.focusTopic ? [data.focusTopic] : [])[0] ?? null,
    recentTopics: asTopicIds(data.recentTopics ?? useSettingsStore.getState().recentTopics),
    lastOpeners: data.lastOpeners ?? useSettingsStore.getState().lastOpeners,
  });
}

async function callChatApi(
  messages: { role: "user" | "assistant"; content: string }[],
  bootstrap: boolean,
  extra?: {
    localHour?: number;
    lastContactAt?: number;
    kind?: MessageKind;
    sessionId?: string;
    sessionWrapUp?: boolean;
  },
): Promise<string> {
  await refreshLocalGoogleDocIfStale();
  const s = useSettingsStore.getState();
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: s.preferredModel,
      topics: s.selectedTopics,
      learnerContext: buildLearnerContextText(s.contextChunks),
      level: s.level,
      formality: s.formality,
      learnerName: s.learnerName || undefined,
      focusTopic: s.focusTopic,
      recentTopics: s.recentTopics,
      lastOpeners: s.lastOpeners,
      messages,
      bootstrap,
      sessionWrapUp: extra?.sessionWrapUp,
      ...extra,
    }),
  });
  const data = (await res.json()) as {
    message?: string;
    error?: string;
    focusTopic?: string | null;
    recentTopics?: string[];
    lastOpeners?: string[];
  };
  if (!res.ok) throw new Error(data.error ?? "Server error");
  if (!data.message) throw new Error("Empty response");
  applyEngineFocus(data);
  return data.message;
}

async function createServerSession(): Promise<string | null> {
  const res = await fetch("/api/sessions", { method: "POST" });
  const data = (await res.json()) as { sessionId?: string; persisted?: boolean };
  if (!res.ok || !data.sessionId) return null;
  return data.sessionId;
}

async function endServerSession(
  sessionId: string,
  preview: string,
  messageCount: number,
): Promise<void> {
  await fetch("/api/sessions", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, preview, messageCount }),
  });
}

type ResumePayload = {
  sessionId: string;
  messages: {
    id: string;
    role: "user" | "assistant";
    content: string;
    kind?: "chat" | "call";
    sessionId?: string;
    createdAt: number;
  }[];
  endedSessions?: ChatSessionMeta[];
};

/** One resume fetch per notification, including a React strict-mode remount. */
const incomingInflight = new Map<string, Promise<ResumePayload | null>>();

/**
 * Bumped when the learner ends a chat. A resume that started before End must
 * not apply afterwards and put the thread back on screen.
 */
let openEpoch = 0;

function incomingKey(request: IncomingOpen): string {
  switch (request.kind) {
    case "session":
      return request.sessionId;
    case "checkin":
      return "checkin";
    default: {
      const _exhaustive: never = request;
      return _exhaustive;
    }
  }
}

function applyResumePayload(data: ResumePayload): void {
  useChatStore.getState().resumeSession(
    data.sessionId,
    data.messages.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      kind: message.kind ?? "chat",
      sessionId: message.sessionId ?? data.sessionId,
      createdAt: message.createdAt,
    })),
    data.endedSessions,
  );
}

function loadIncoming(request: IncomingOpen): Promise<ResumePayload | null> {
  const key = incomingKey(request);
  const existing = incomingInflight.get(key);
  if (existing) return existing;
  const promise = fetchIncomingOnce(request).finally(() => {
    if (incomingInflight.get(key) === promise) incomingInflight.delete(key);
  });
  incomingInflight.set(key, promise);
  return promise;
}

/**
 * Open the thread a check-in already wrote. Returns the session id, or null
 * when there is nothing waiting (or the server is not signed in).
 */
export async function openIncomingChat(request: IncomingOpen): Promise<string | null> {
  const epoch = openEpoch;
  const data = await loadIncoming(request);
  if (!data || epoch !== openEpoch) return null;
  applyResumePayload(data);
  return data.sessionId;
}

async function fetchIncomingOnce(request: IncomingOpen): Promise<ResumePayload | null> {
  let body: { sessionId: string } | { checkin: true };
  switch (request.kind) {
    case "session":
      body = { sessionId: request.sessionId };
      break;
    case "checkin":
      body = { checkin: true };
      break;
    default: {
      const _exhaustive: never = request;
      return _exhaustive;
    }
  }

  try {
    const res = await fetch("/api/sessions/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      sessionId?: string | null;
      messages?: ResumePayload["messages"];
      endedSessions?: ChatSessionMeta[];
    };
    if (!data.sessionId || !data.messages || data.messages.length === 0) return null;
    return {
      sessionId: data.sessionId,
      messages: data.messages,
      endedSessions: data.endedSessions,
    };
  } catch {
    return null;
  }
}

/** Start a typed chat. If Honza already wrote and is waiting, continue that thread. */
export function startChatSession(): Promise<string> {
  if (sessionReady) return sessionReady;
  const state = useChatStore.getState();
  if (state.chatPhase === "active" && state.activeSessionId) {
    return Promise.resolve(state.activeSessionId);
  }

  // Composer and the waiting hint flip before the check-in lookup. A waiting
  // check-in replaces this empty thread; otherwise the server id swaps in later.
  const localId = state.startSession();

  // Assigned before the async body reads it. A const cannot refer to itself.
  let ready: Promise<string> | null = null;
  ready = (async () => {
    try {
      const waiting = await loadIncoming({ kind: "checkin" });
      const current = useChatStore.getState();
      if (current.chatPhase !== "active" || current.activeSessionId !== localId) {
        return current.activeSessionId ?? localId;
      }
      if (waiting) {
        applyResumePayload(waiting);
        return waiting.sessionId;
      }

      const serverId = await createServerSession();
      const after = useChatStore.getState();
      if (
        serverId &&
        after.chatPhase === "active" &&
        after.activeSessionId === localId
      ) {
        after.replaceActiveSessionId(serverId);
        return serverId;
      }
      return useChatStore.getState().activeSessionId ?? localId;
    } finally {
      if (sessionReady === ready) sessionReady = null;
    }
  })();
  sessionReady = ready;
  return ready;
}

/**
 * Close the active session on screen first, then PATCH the archive.
 * Callers must not wait on the save before changing the screen.
 */
export function endChatSessionAction(): void {
  openEpoch += 1;
  const chat = useChatStore.getState();
  const { activeSessionId, messages } = chat;
  if (!activeSessionId) {
    chat.endSession();
    return;
  }
  const thread = messages.filter(
    (m) => (m.kind ?? "chat") !== "call" && (m.role === "user" || m.role === "assistant"),
  );
  const sessionId = activeSessionId;
  const preview = thread.length > 0 ? previewFromThread(thread) : "";
  const messageCount = thread.length;
  chat.endSession();
  if (messageCount > 0) {
    void endServerSession(sessionId, preview, messageCount).catch(() => {
      // The thread is already closed on screen. A missed save stays open on
      // the server until the next end or resume.
    });
  }
}

export async function sendUserTurn(
  text: string,
  kind: MessageKind = "chat",
): Promise<string | null> {
  if (sessionReady) await sessionReady;
  const chat = useChatStore.getState();
  const prior = threadMessages();
  if (kind === "chat" && prior.length >= CHAT_SESSION_MAX_MESSAGES) {
    return null;
  }

  chat.addUserMessage(text, kind);
  const thread = threadMessages().map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));
  const sessionWrapUp =
    kind === "chat" && thread.length >= CHAT_SESSION_MAX_MESSAGES - 1;

  chat.setStatus("loading");
  chat.setError(null);
  useMoodStore.getState().setMood("thinking");
  try {
    const reply = await callChatApi(thread, false, {
      kind,
      sessionId: chat.activeSessionId ?? undefined,
      sessionWrapUp,
    });
    await scheduleAssistantReveal(reply, kind);
    if (kind === "chat" && sessionWrapUp) {
      await endChatSessionAction();
    }
    return reply;
  } catch (e) {
    clearReplyChoreography();
    useChatStore.getState().setError(e instanceof Error ? e.message : "Unknown error");
    useMoodStore.getState().setMood("oops");
    return null;
  } finally {
    useChatStore.getState().setStatus("idle");
  }
}

export async function startCallOpener(): Promise<string | null> {
  const chat = useChatStore.getState();
  const prior = [
    ...chat.messages,
    ...Object.values(chat.archivedMessages).flat(),
  ];
  const lastContactAt = prior.length ? prior[prior.length - 1]!.createdAt : 0;

  chat.setStatus("loading");
  chat.setError(null);
  useMoodStore.getState().setMood("thinking");
  try {
    const reply = await callChatApi([], true, {
      localHour: new Date().getHours(),
      lastContactAt,
      kind: "call",
      sessionId: chat.activeSessionId ?? undefined,
    });
    useChatStore.getState().addAssistantMessage(reply, "call");
    return reply;
  } catch (e) {
    useChatStore.getState().setError(e instanceof Error ? e.message : "Unknown error");
    useMoodStore.getState().setMood("oops");
    return null;
  } finally {
    useChatStore.getState().setStatus("idle");
  }
}

/** Fetch transcript for a session from the server (signed-in users). */
export async function fetchSessionMessages(sessionId: string) {
  const res = await fetch(`/api/sessions/${sessionId}`);
  const data = (await res.json()) as {
    persisted?: boolean;
    messages?: {
      id: string;
      role: "user" | "assistant";
      content: string;
      kind?: MessageKind;
      createdAt: number;
    }[];
  };
  if (!res.ok || !data.messages) return null;
  return data.messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    kind: m.kind ?? "chat",
    sessionId,
    createdAt: m.createdAt,
  }));
}
