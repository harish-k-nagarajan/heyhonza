"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import { useMoodExpression } from "@/hooks/useMoodExpression";
import { useScreenReady } from "@/hooks/useScreenReady";
import { initiateOpener } from "@/lib/client/chat-actions";
import { ROUTES } from "@/lib/constants";
import { DESIGNS } from "@/lib/design/registry";
import type { DesignFamily, DesignId } from "@/lib/design/registry";
import type { MoodExpression } from "@/lib/mood/expression";
import { useChatStore } from "@/stores/useChatStore";
import { useDesignStore } from "@/stores/useDesignStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { ChatMessage } from "@/types";

/**
 * Behaviour for the Home surface (P3): hydration gating, the onboarding
 * redirect, the "Honza opens the conversation" kick-off, and the derived
 * waiting/initiating state. A design consumes this and stays pure presentation.
 */
export type HomeScreen = {
  /** False until fully hydrated + onboarded — presentation shows Loading. */
  ready: boolean;
  design: DesignId;
  family: DesignFamily;
  expression: MoodExpression;
  /** Latest assistant message waiting for the user, if any. */
  waiting: ChatMessage | null;
  /** Honza is composing his very first line (no waiting message yet). */
  initiating: boolean;
  lastError: string | null;
  retryOpener: () => void;
  goChat: () => void;
  goCall: () => void;
};

export function useHomeScreen(): HomeScreen {
  const router = useRouter();
  const ready = useScreenReady();
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);

  const messages = useChatStore((s) => s.messages);
  const status = useChatStore((s) => s.status);
  const lastError = useChatStore((s) => s.lastError);

  const design = useDesignStore((s) => s.design);
  const expression = useMoodExpression();

  useEffect(() => {
    if (ready && !onboardingComplete) router.replace(ROUTES.onboarding);
  }, [ready, onboardingComplete, router]);

  // The core differentiator: Honza initiates. On load, if there's no thread yet,
  // generate an unprompted opening line (engine + user context + time of day).
  useEffect(() => {
    if (!ready || !onboardingComplete) return;
    if (messages.length > 0) return;
    void initiateOpener();
  }, [ready, onboardingComplete, messages.length]);

  const waiting = useMemo(
    () => [...messages].reverse().find((m) => m.role === "assistant") ?? null,
    [messages],
  );

  return {
    ready: ready && onboardingComplete,
    design,
    family: DESIGNS[design].family,
    expression,
    waiting,
    initiating: status === "loading" && !waiting,
    lastError,
    retryOpener: () => void initiateOpener(),
    goChat: () => router.push(ROUTES.chat),
    goCall: () => router.push(ROUTES.call),
  };
}
