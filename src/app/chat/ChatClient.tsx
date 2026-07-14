"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Composer } from "@/components/chat/Composer";
import { MessageList } from "@/components/chat/MessageList";
import { HonzaOrb } from "@/components/honza/HonzaOrb";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ROUTES } from "@/lib/constants";
import { initiateOpener, sendUserTurn } from "@/lib/client/chat-actions";
import { useSettingsHydrated } from "@/hooks/useSettingsHydrated";
import { useChatStore } from "@/stores/useChatStore";
import { useMoodStore } from "@/stores/useMoodStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useSyncStore } from "@/stores/useSyncStore";

export default function ChatClient() {
  const router = useRouter();
  const localHydrated = useSettingsHydrated();
  const serverChecked = useSyncStore((s) => s.checked);
  const hydrated = localHydrated && serverChecked;
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);

  const messages = useChatStore((s) => s.messages);
  const status = useChatStore((s) => s.status);
  const lastError = useChatStore((s) => s.lastError);
  const clearThread = useChatStore((s) => s.clearThread);

  // Honza's face here reads the one shared mood store (AppShell tints the rest
  // of the app from the same value). The chat-actions drive it.
  const mood = useMoodStore((s) => s.mood);
  const setMood = useMoodStore((s) => s.setMood);

  useEffect(() => {
    if (hydrated && !onboardingComplete) {
      router.replace(ROUTES.onboarding);
    }
  }, [hydrated, onboardingComplete, router]);

  // Honza opens the conversation when the thread is empty (shared with Home).
  useEffect(() => {
    if (!hydrated || !onboardingComplete) return;
    if (messages.length > 0) return;
    void initiateOpener();
  }, [hydrated, onboardingComplete, messages.length]);

  // Leaving chat shouldn't strand a stale mood on other screens.
  useEffect(() => {
    return () => setMood("idle");
  }, [setMood]);

  if (!hydrated || !onboardingComplete) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  const threadMessages = messages.filter(
    (m) => m.role === "user" || m.role === "assistant",
  );

  const showEmptyState = threadMessages.length === 0 && status !== "loading" && !lastError;

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col gap-3">
      {/* Character-first header: Honza leads, and his face reacts to state. */}
      <header className="flex shrink-0 items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <HonzaOrb state={mood} size="avatar" />
          <div className="flex flex-col gap-1">
            <SectionLabel>Chat with Honza</SectionLabel>
            <span className="font-sans text-xs text-muted-foreground">
              {status === "loading"
                ? "Honza is typing…"
                : "Reply in Czech, get corrected."}
            </span>
          </div>
        </div>
        <Button type="button" variant="ghost" className="text-xs" onClick={clearThread}>
          New chat
        </Button>
      </header>

      {lastError ? (
        <Card className="border-accent/40 bg-muted">
          <p className="text-sm text-accent">{lastError}</p>
          {threadMessages.length === 0 ? (
            <Button
              type="button"
              variant="secondary"
              className="mt-3"
              onClick={() => void initiateOpener()}
            >
              Try again
            </Button>
          ) : null}
        </Card>
      ) : null}

      <Card className="flex min-h-0 flex-1 flex-col gap-3 p-3">
        {showEmptyState ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <HonzaOrb state="idle" size="avatar" />
            <p className="font-sans text-sm leading-relaxed text-muted-foreground">
              Honza will open the conversation in Czech. Reply below and he&apos;ll
              keep it going.
            </p>
          </div>
        ) : (
          <MessageList messages={threadMessages} />
        )}
        <Composer onSend={(t) => void sendUserTurn(t)} disabled={status === "loading"} />
      </Card>
    </div>
  );
}
