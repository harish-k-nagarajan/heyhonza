"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useMoodExpression } from "@/hooks/useMoodExpression";
import { useProviderStatus } from "@/hooks/useProviderStatus";
import { useScreenReady } from "@/hooks/useScreenReady";
import {
  endChatSessionAction,
  sendUserTurn,
  startChatSession,
} from "@/lib/client/chat-actions";
import { chatHistoryRoute, ROUTES } from "@/lib/constants";
import { DESIGNS } from "@/lib/design/registry";
import type { DesignFamily, DesignId } from "@/lib/design/registry";
import type { MoodExpression } from "@/lib/mood/expression";
import { useChatStore } from "@/stores/useChatStore";
import { useDesignStore } from "@/stores/useDesignStore";
import { useMoodStore } from "@/stores/useMoodStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { ChatMessage, ChatSessionMeta } from "@/types";

export type ChatScreen = {
  ready: boolean;
  design: DesignId;
  family: DesignFamily;
  expression: MoodExpression;
  threadMessages: ChatMessage[];
  endedSessions: ChatSessionMeta[];
  status: ReturnType<typeof useChatStore.getState>["status"];
  lastError: string | null;
  loading: boolean;
  chatPhase: "idle" | "active";
  /** True until the learner sends their first message (composer layout). */
  heroMode: boolean;
  /** No session yet — show Start chat gate instead of composer. */
  showStartGate: boolean;
  /** OpenRouter BYOK is present (Settings / onboarding). */
  llmReady: boolean;
  /** Provider status has been fetched. */
  providersLoaded: boolean;
  showEmptyState: boolean;
  historyOpen: boolean;
  setHistoryOpen: (open: boolean) => void;
  startChat: () => void;
  endChat: () => void;
  send: (text: string) => void;
  openHistorySession: (sessionId: string) => void;
};

export function useChatScreen(): ChatScreen {
  const router = useRouter();
  const ready = useScreenReady();
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);

  const messages = useChatStore((s) => s.messages);
  const status = useChatStore((s) => s.status);
  const lastError = useChatStore((s) => s.lastError);
  const chatPhase = useChatStore((s) => s.chatPhase);
  const endedSessions = useChatStore((s) => s.endedSessions);

  const design = useDesignStore((s) => s.design);
  const expression = useMoodExpression();
  const setMood = useMoodStore((s) => s.setMood);
  const { llmReady, loaded: providersLoaded } = useProviderStatus();

  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (ready && !onboardingComplete) router.replace(ROUTES.onboarding);
  }, [ready, onboardingComplete, router]);

  useEffect(() => {
    return () => setMood("idle");
  }, [setMood]);

  const threadMessages = useMemo(
    () => messages.filter((m) => m.role === "user" || m.role === "assistant"),
    [messages],
  );

  const heroMode = !threadMessages.some((m) => m.role === "user");
  const showStartGate = chatPhase === "idle";

  const showEmptyState =
    chatPhase === "active" &&
    threadMessages.length === 0 &&
    status !== "loading" &&
    !lastError;

  const startChat = useCallback(() => {
    if (!llmReady) return;
    void startChatSession();
  }, [llmReady]);

  const endChat = useCallback(() => {
    void endChatSessionAction();
    setHistoryOpen(false);
  }, []);

  const openHistorySession = useCallback(
    (sessionId: string) => {
      setHistoryOpen(false);
      router.push(chatHistoryRoute(sessionId));
    },
    [router],
  );

  return {
    ready: ready && onboardingComplete,
    design,
    family: DESIGNS[design].family,
    expression,
    threadMessages,
    endedSessions,
    status,
    lastError,
    loading: status === "loading",
    chatPhase,
    heroMode,
    showStartGate,
    llmReady,
    providersLoaded,
    showEmptyState,
    historyOpen,
    setHistoryOpen,
    startChat,
    endChat,
    send: (text) => void sendUserTurn(text),
    openHistorySession,
  };
}
