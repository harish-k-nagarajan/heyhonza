"use client";

import { buildLearnerContextText } from "@/lib/context";
import {
  clearReplyChoreography,
  scheduleAssistantReveal,
} from "@/hooks/useReplyChoreography";
import { previewFromThread, useChatStore } from "@/stores/useChatStore";
import { useMoodStore } from "@/stores/useMoodStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { MessageKind } from "@/types";

/**
 * The single client path to Honza. Chat calls these to talk to `/api/chat`,
 * update the shared chat store, and drive Honza's shared mood.
 */

let initiateLock = false;

async function callChatApi(
  messages: { role: "user" | "assistant"; content: string }[],
  bootstrap: boolean,
  extra?: {
    localHour?: number;
    lastContactAt?: number;
    kind?: MessageKind;
    sessionId?: string;
  },
): Promise<string> {
  const s = useSettingsStore.getState();
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: s.preferredModel,
      topics: s.selectedTopics,
      learnerContext: buildLearnerContextText(s.contextChunks),
      level: s.level,
      messages,
      bootstrap,
      ...extra,
    }),
  });
  const data = (await res.json()) as { message?: string; error?: string };
  if (!res.ok) throw new Error(data.error ?? "Server error");
  if (!data.message) throw new Error("Empty response");
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
export async function startChatSession(): Promise<string> {
  const serverId = await createServerSession();
  return useChatStore.getState().startSession(serverId ?? undefined);
}

/** End the active session and archive it for history. */
export async function endChatSessionAction(): Promise<void> {
  const chat = useChatStore.getState();
  const { activeSessionId, messages } = chat;
  if (!activeSessionId) {
    chat.endSession();
    return;
  }
  const thread = messages.filter((m) => m.role === "user" || m.role === "assistant");
  if (thread.length > 0) {
    await endServerSession(
      activeSessionId,
      previewFromThread(thread),
      thread.length,
    );
  }
  chat.endSession();
}

/** Honza initiates within the active session. */
export async function initiateOpener(): Promise<void> {
  const chat = useChatStore.getState();
  if (chat.messages.length > 0 || initiateLock || !chat.activeSessionId) return;
  initiateLock = true;
  chat.setStatus("loading");
  chat.setError(null);
  useMoodStore.getState().setMood("thinking");
  try {
    const reply = await callChatApi([], true, {
      localHour: new Date().getHours(),
      lastContactAt: 0,
      sessionId: chat.activeSessionId,
    });
    if (useChatStore.getState().messages.length === 0) {
      await scheduleAssistantReveal(reply, "chat", {
        shouldReveal: () => useChatStore.getState().messages.length === 0,
      });
    }
  } catch (e) {
    clearReplyChoreography();
    useChatStore.getState().setError(e instanceof Error ? e.message : "Unknown error");
    useMoodStore.getState().setMood("oops");
  } finally {
    initiateLock = false;
    useChatStore.getState().setStatus("idle");
  }
}

export async function sendUserTurn(
  text: string,
  kind: MessageKind = "chat",
): Promise<string | null> {
  const chat = useChatStore.getState();
  chat.addUserMessage(text, kind);
  const thread = useChatStore
    .getState()
    .messages.filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  chat.setStatus("loading");
  chat.setError(null);
  useMoodStore.getState().setMood("thinking");
  try {
    const reply = await callChatApi(thread, false, {
      kind,
      sessionId: chat.activeSessionId ?? undefined,
    });
    await scheduleAssistantReveal(reply, kind);
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
