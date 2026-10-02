"use client";

import { useChatStore } from "@/stores/useChatStore";
import { useMoodStore } from "@/stores/useMoodStore";
import type { MessageKind } from "@/types";

const TYPING_MIN_MS = 400;
const TYPING_MAX_MS = 1200;

let revealTimer: ReturnType<typeof setTimeout> | null = null;

/** Clamp typing hold to spec §4.3: 400–1200ms from reply length. */
export function computeTypingDuration(reply: string): number {
  return Math.min(TYPING_MAX_MS, Math.max(TYPING_MIN_MS, TYPING_MIN_MS + reply.length * 12));
}

/** Cancel any in-flight reveal and clear the typing preview. */
export function clearReplyChoreography(): void {
  if (revealTimer !== null) {
    clearTimeout(revealTimer);
    revealTimer = null;
  }
  useChatStore.getState().setTypingPreview(null);
}

/**
 * After the API resolves, show typing preview then reveal the assistant message.
 * Replaces immediate addAssistantMessage + flashMood in sendUserTurn.
 */
export function scheduleAssistantReveal(
  reply: string,
  kind: MessageKind = "chat",
  options?: { shouldReveal?: () => boolean },
): Promise<void> {
  clearReplyChoreography();

  const chat = useChatStore.getState();
  chat.setTypingPreview(reply);

  const typingMs = computeTypingDuration(reply);

  return new Promise((resolve) => {
    revealTimer = setTimeout(() => {
      revealTimer = null;
      const state = useChatStore.getState();

      if (state.typingPreview !== reply) {
        resolve();
        return;
      }

      if (options?.shouldReveal && !options.shouldReveal()) {
        state.setTypingPreview(null);
        resolve();
        return;
      }

      state.addAssistantMessage(reply, kind);
      state.setTypingPreview(null);

      if (kind !== "call") {
        useMoodStore.getState().flashMood("speaking", { ms: 900 });
      }

      resolve();
    }, typingMs);
  });
}
