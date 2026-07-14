"use client";

import { buildLearnerContextText } from "@/lib/context";
import { useChatStore } from "@/stores/useChatStore";
import { useMoodStore } from "@/stores/useMoodStore";
import { useSettingsStore } from "@/stores/useSettingsStore";

/**
 * The single client path to Honza. Both Chat and Home (Phase 7 initiation) call
 * these, so there's one place that talks to `/api/chat`, updates the shared chat
 * store, and drives Honza's shared mood (thinking → speaking / oops). In DB mode
 * the server persists turns and overrides context; the local values sent here
 * are what the server falls back to in local pass-through dev.
 */

// Module-level lock so Home and Chat can't both fire the opener at once.
let initiateLock = false;

async function callChatApi(
  messages: { role: "user" | "assistant"; content: string }[],
  bootstrap: boolean,
  extra?: { localHour?: number; lastContactAt?: number },
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

/** Honza initiates: generate an unprompted opener if the thread is empty. */
export async function initiateOpener(): Promise<void> {
  const chat = useChatStore.getState();
  if (chat.messages.length > 0 || initiateLock) return;
  initiateLock = true;
  chat.setStatus("loading");
  chat.setError(null);
  useMoodStore.getState().setMood("thinking");
  try {
    const reply = await callChatApi([], true, {
      localHour: new Date().getHours(),
      lastContactAt: 0,
    });
    if (useChatStore.getState().messages.length === 0) {
      useChatStore.getState().addAssistantMessage(reply);
      useMoodStore.getState().flashMood("speaking", { ms: 900 });
    }
  } catch (e) {
    useChatStore.getState().setError(e instanceof Error ? e.message : "Unknown error");
    useMoodStore.getState().setMood("oops");
  } finally {
    initiateLock = false;
    useChatStore.getState().setStatus("idle");
  }
}

/** Send the user's Czech turn and append Honza's reply. */
export async function sendUserTurn(text: string): Promise<void> {
  const chat = useChatStore.getState();
  chat.addUserMessage(text);
  const thread = useChatStore
    .getState()
    .messages.filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  chat.setStatus("loading");
  chat.setError(null);
  useMoodStore.getState().setMood("thinking");
  try {
    const reply = await callChatApi(thread, false);
    useChatStore.getState().addAssistantMessage(reply);
    useMoodStore.getState().flashMood("speaking", { ms: 900 });
  } catch (e) {
    useChatStore.getState().setError(e instanceof Error ? e.message : "Unknown error");
    useMoodStore.getState().setMood("oops");
  } finally {
    useChatStore.getState().setStatus("idle");
  }
}
