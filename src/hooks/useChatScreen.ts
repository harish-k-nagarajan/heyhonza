"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { useMoodExpression } from "@/hooks/useMoodExpression";
import { useProviderStatus } from "@/hooks/useProviderStatus";
import { useNeedsOnboarding, useScreenReady } from "@/hooks/useScreenReady";
import {
  endChatSessionAction,
  openIncomingChat,
  sendUserTurn,
  startChatSession,
} from "@/lib/client/chat-actions";
import { incomingFromLocation } from "@/lib/client/incoming-chat";
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

export function useChatScreen(openingNotification = false): ChatScreen {
  const router = useRouter();
  const ready = useScreenReady();
  const needsOnboarding = useNeedsOnboarding();
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
  const incomingOpen = useChatStore((s) => s.incomingOpen);
  const openedCheckIn = useRef<string | null>(null);

  useLayoutEffect(() => {
    const request = incomingFromLocation();
    if (!openingNotification && !request) return;
    const chat = useChatStore.getState();
    const alreadyShowing =
      request?.kind === "session" &&
      chat.chatPhase === "active" &&
      chat.activeSessionId === request.sessionId;
    if (alreadyShowing) return;
    chat.setStatus("loading");
  }, [openingNotification]);

  useEffect(() => {
    const request = incomingOpen ?? incomingFromLocation();
    if (!request) return;
    const key = request.kind === "session" ? request.sessionId : "checkin";
    const chat = useChatStore.getState();
    const alreadyShowing =
      chat.chatPhase === "active" &&
      (request.kind === "checkin"
        ? chat.messages.some((message) => message.role === "assistant")
        : chat.activeSessionId === request.sessionId);
    if (openedCheckIn.current === key && alreadyShowing) {
      const chatNow = useChatStore.getState();
      chatNow.setIncomingOpen(null);
      if (chatNow.status === "loading") chatNow.setStatus("idle");
      if (window.location.pathname === ROUTES.chat && window.location.search) {
        router.replace(ROUTES.chat);
      }
      return;
    }

    useChatStore.getState().setStatus("loading");
    let cancelled = false;
    void (async () => {
      try {
        const sessionId = await openIncomingChat(request);
        if (cancelled) return;
        if (sessionId) openedCheckIn.current = key;
        if (!sessionId) useChatStore.getState().setIncomingOpen(null);
        if (window.location.pathname === ROUTES.chat && window.location.search) {
          router.replace(ROUTES.chat);
        }
      } finally {
        if (!cancelled && useChatStore.getState().status === "loading") {
          useChatStore.getState().setStatus("idle");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [incomingOpen, router]);

  useEffect(() => {
    if (needsOnboarding) router.replace(ROUTES.onboarding);
  }, [needsOnboarding, router]);

  useEffect(() => {
    return () => setMood("idle");
  }, [setMood]);

  const threadMessages = useMemo(() => {
    if (chatPhase !== "active") return [];
    return messages.filter(
      (m) =>
        (m.kind ?? "chat") === "chat" &&
        (m.role === "user" || m.role === "assistant"),
    );
  }, [chatPhase, messages]);

  const heroMode = !threadMessages.some((m) => m.role === "user");
  const showStartGate = chatPhase === "idle" && !openingNotification && !incomingOpen;

  const showEmptyState =
    chatPhase === "active" &&
    threadMessages.length === 0 &&
    status !== "loading" &&
    !lastError;

  const startChat = useCallback(() => {
    if (providersLoaded && !llmReady) return;
    void startChatSession();
  }, [llmReady, providersLoaded]);

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
