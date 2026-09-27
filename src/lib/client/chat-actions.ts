"use client";

import { CHAT_SESSION_MAX_MESSAGES } from "@/lib/constants";
import { buildLearnerContextText, DOC_CACHE_MS } from "@/lib/context";
import {
  clearReplyChoreography,
  scheduleAssistantReveal,
} from "@/hooks/useReplyChoreography";
import { previewFromThread, useChatStore } from "@/stores/useChatStore";
import { useMoodStore } from "@/stores/useMoodStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { isDbMode } from "@/lib/client/state-sync";
import { upsertContext } from "@/lib/client/context-actions";
import { asTopicIds } from "@/lib/topic-focus";
import type { MessageKind } from "@/types";

/**
 * The single client path to Honza. Chat calls these to talk to `/api/chat`,
 * update the shared chat store, and drive Honza's shared mood.
 */

let initiateLock = false;
/** Bumped when the learner sends or ends, so a late opener cannot land on top. */
let openerGen = 0;
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

/** Start a new typed-chat session locally and on the server when persisted. */
export function startChatSession(): Promise<string> {
  const state = useChatStore.getState();
  if (state.chatPhase === "active" && state.activeSessionId) {
    return sessionReady ?? Promise.resolve(state.activeSessionId);
  }

  // Flip to the composer before any network wait. The server id replaces this
  // one when it arrives.
  const localId = state.startSession();
  const ready = (async () => {
    try {
      const serverId = await createServerSession();
      const current = useChatStore.getState();
      if (
        serverId &&
        current.chatPhase === "active" &&
        current.activeSessionId === localId
      ) {
        current.replaceActiveSessionId(serverId);
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

/** End the active session and archive it for history. */
export async function endChatSessionAction(): Promise<void> {
  openerGen += 1;
  const chat = useChatStore.getState();
  const { activeSessionId, messages } = chat;
  if (!activeSessionId) {
    chat.endSession();
    return;
  }
  const thread = messages.filter(
    (m) => (m.kind ?? "chat") !== "call" && (m.role === "user" || m.role === "assistant"),
  );
  if (thread.length > 0) {
    await endServerSession(
      activeSessionId,
      previewFromThread(thread),
      thread.length,
    );
  }
  chat.endSession();
}

function openerStillCurrent(sessionId: string, gen: number): boolean {
  const state = useChatStore.getState();
  return (
    gen === openerGen &&
    state.chatPhase === "active" &&
    state.activeSessionId === sessionId &&
    !state.messages.some((message) => message.role === "user")
  );
}

/**
 * Honza's first line in the session the learner just opened.
 * The composer is already on screen. This does not take the loading state,
 * so the thread does not sit on the typing glyphs while the reply is fetched.
 */
export async function initiateOpener(): Promise<void> {
  const chat = useChatStore.getState();
  if (
    chat.chatPhase !== "active" ||
    chat.messages.some((message) => message.role === "user") ||
    initiateLock ||
    !chat.activeSessionId
  ) {
    return;
  }
  const sessionId = chat.activeSessionId;
  const gen = ++openerGen;
  initiateLock = true;
  chat.setError(null);
  try {
    const prior = [
      ...chat.messages,
      ...Object.values(chat.archivedMessages).flat(),
    ];
    const lastContactAt = prior.length ? prior[prior.length - 1]!.createdAt : 0;
    const reply = await callChatApi([], true, {
      localHour: new Date().getHours(),
      lastContactAt,
      sessionId,
    });
    if (!openerStillCurrent(sessionId, gen)) return;
    if (useChatStore.getState().messages.length > 0) return;
    useChatStore.getState().addAssistantMessage(reply, "chat");
    useMoodStore.getState().flashMood("speaking", { ms: 900 });
  } catch (e) {
    if (!openerStillCurrent(sessionId, gen)) return;
    clearReplyChoreography();
    useChatStore.getState().setError(e instanceof Error ? e.message : "Unknown error");
    useMoodStore.getState().setMood("oops");
  } finally {
    initiateLock = false;
  }
}

export async function sendUserTurn(
  text: string,
  kind: MessageKind = "chat",
): Promise<string | null> {
  if (kind === "chat") openerGen += 1;
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
