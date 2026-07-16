"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import { useMoodExpression } from "@/hooks/useMoodExpression";
import { useScreenReady } from "@/hooks/useScreenReady";
import { initiateOpener, sendUserTurn } from "@/lib/client/chat-actions";
import { ROUTES } from "@/lib/constants";
import { DESIGNS } from "@/lib/design/registry";
import type { DesignFamily, DesignId } from "@/lib/design/registry";
import type { MoodExpression } from "@/lib/mood/expression";
import { useChatStore } from "@/stores/useChatStore";
import { useDesignStore } from "@/stores/useDesignStore";
import { useMoodStore } from "@/stores/useMoodStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { ChatMessage } from "@/types";

/**
 * Behaviour for the Chat surface (P3): hydration gating, onboarding redirect,
 * opener kick-off (shared with Home), the typed-reply action, and thread
 * derivation. Honza's face reads the one shared mood store; leaving chat resets
 * it so a stale mood doesn't strand on other screens.
 */
export type ChatScreen = {
  ready: boolean;
  design: DesignId;
  family: DesignFamily;
  expression: MoodExpression;
  /** User + assistant turns only (system/tool turns filtered out). */
  threadMessages: ChatMessage[];
  status: ReturnType<typeof useChatStore.getState>["status"];
  lastError: string | null;
  loading: boolean;
  showEmptyState: boolean;
  send: (text: string) => void;
  retryOpener: () => void;
  clearThread: () => void;
};

export function useChatScreen(): ChatScreen {
  const router = useRouter();
  const ready = useScreenReady();
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);

  const messages = useChatStore((s) => s.messages);
  const status = useChatStore((s) => s.status);
  const lastError = useChatStore((s) => s.lastError);
  const clearThread = useChatStore((s) => s.clearThread);

  const design = useDesignStore((s) => s.design);
  const expression = useMoodExpression();
  const setMood = useMoodStore((s) => s.setMood);

  useEffect(() => {
    if (ready && !onboardingComplete) router.replace(ROUTES.onboarding);
  }, [ready, onboardingComplete, router]);

  useEffect(() => {
    if (!ready || !onboardingComplete) return;
    if (messages.length > 0) return;
    void initiateOpener();
  }, [ready, onboardingComplete, messages.length]);

  // Leaving chat shouldn't strand a stale mood on other screens.
  useEffect(() => {
    return () => setMood("idle");
  }, [setMood]);

  const threadMessages = useMemo(
    () => messages.filter((m) => m.role === "user" || m.role === "assistant"),
    [messages],
  );

  const showEmptyState =
    threadMessages.length === 0 && status !== "loading" && !lastError;

  return {
    ready: ready && onboardingComplete,
    design,
    family: DESIGNS[design].family,
    expression,
    threadMessages,
    status,
    lastError,
    loading: status === "loading",
    showEmptyState,
    send: (text) => void sendUserTurn(text),
    retryOpener: () => void initiateOpener(),
    clearThread,
  };
}
