"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
import { incomingFromLocation, incomingFromUrl } from "@/lib/client/incoming-chat";
import { chatHistoryRoute, ROUTES } from "@/lib/constants";
import { DESIGNS } from "@/lib/design/registry";
import type { DesignFamily, DesignId } from "@/lib/design/registry";
import type { MoodExpression } from "@/lib/mood/expression";
import { useChatStore, type IncomingOpen } from "@/stores/useChatStore";
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

function incomingFromSearch(search: string): IncomingOpen | null {
  const path = search ? `${ROUTES.chat}?${search}` : ROUTES.chat;
  return incomingFromUrl(new URL(path, "http://localhost"));
}

function incomingIdentity(request: IncomingOpen | null): string | null {
  if (!request) return null;
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
  const searchParams = useSearchParams();
  const searchKey = searchParams?.toString() ?? "";
  const urlIncoming = useMemo(() => incomingFromSearch(searchKey), [searchKey]);
  /** Resume for this open key has finished, so End can show Start again. */
  const [settledOpenKey, setSettledOpenKey] = useState<string | null>(null);
  const [seenSearchKey, setSeenSearchKey] = useState(searchKey);
  if (searchKey !== seenSearchKey) {
    setSeenSearchKey(searchKey);
    // A deep link that arrives after /chat was clean is a new open, even when
    // this session id already settled. Otherwise End, then the same link, stays
    // on Start.
    if (seenSearchKey === "" && searchKey !== "" && settledOpenKey !== null) {
      setSettledOpenKey(null);
    }
  }

  const openKey = incomingIdentity(incomingOpen) ?? incomingIdentity(urlIncoming);
  /** URL open still waiting on resume. Hides Start on this paint. */
  const openingQuiet =
    chatPhase === "idle" &&
    openKey !== null &&
    (settledOpenKey !== openKey || status === "loading");

  useLayoutEffect(() => {
    const request = urlIncoming ?? incomingFromLocation();
    const key = incomingIdentity(request);
    if (!request || (key && settledOpenKey === key)) return;
    // useSearchParams is the first-render source. If it is empty, the live URL
    // still has to hide Start before paint. The store update re-renders first.
    if (!urlIncoming && !incomingOpen) {
      useChatStore.getState().setIncomingOpen(request);
    }
    const chat = useChatStore.getState();
    const alreadyShowing =
      request.kind === "session" &&
      chat.chatPhase === "active" &&
      chat.activeSessionId === request.sessionId &&
      chat.messages.some((message) => message.role === "assistant");
    if (alreadyShowing) return;
    if (chat.status !== "loading") chat.setStatus("loading");
  }, [incomingOpen, searchKey, settledOpenKey, urlIncoming]);

  useEffect(() => {
    const request = incomingOpen ?? urlIncoming ?? incomingFromLocation();
    if (!request) return;
    const key = incomingIdentity(request);
    if (!key) return;
    const chat = useChatStore.getState();
    const alreadyShowing =
      chat.chatPhase === "active" &&
      (request.kind === "checkin"
        ? chat.messages.some((message) => message.role === "assistant")
        : chat.activeSessionId === request.sessionId &&
          chat.messages.some((message) => message.role === "assistant"));
    if (settledOpenKey === key && alreadyShowing) {
      const chatNow = useChatStore.getState();
      chatNow.setIncomingOpen(null);
      if (chatNow.status === "loading") chatNow.setStatus("idle");
      if (window.location.pathname === ROUTES.chat && window.location.search) {
        router.replace(ROUTES.chat);
      }
      return;
    }
    if (settledOpenKey === key && !incomingOpen) return;
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
        if (!cancelled) {
          setSettledOpenKey(key);
          if (useChatStore.getState().status === "loading") {
            useChatStore.getState().setStatus("idle");
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [incomingOpen, router, settledOpenKey, urlIncoming]);

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
  const showStartGate = chatPhase === "idle" && !openingQuiet && !openingNotification;

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
    loading: status === "loading" || openingQuiet,
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
