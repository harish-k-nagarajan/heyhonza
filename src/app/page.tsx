"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import { HonzaOrb } from "@/components/honza/HonzaOrb";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ROUTES } from "@/lib/constants";
import { initiateOpener } from "@/lib/client/chat-actions";
import { useSettingsHydrated } from "@/hooks/useSettingsHydrated";
import { useChatStore } from "@/stores/useChatStore";
import { useMoodStore } from "@/stores/useMoodStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useSyncStore } from "@/stores/useSyncStore";

export default function HomePage() {
  const router = useRouter();
  const localHydrated = useSettingsHydrated();
  const serverChecked = useSyncStore((s) => s.checked);
  const hydrated = localHydrated && serverChecked;
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);

  const messages = useChatStore((s) => s.messages);
  const status = useChatStore((s) => s.status);
  const lastError = useChatStore((s) => s.lastError);
  const mood = useMoodStore((s) => s.mood);

  useEffect(() => {
    if (hydrated && !onboardingComplete) {
      router.replace(ROUTES.onboarding);
    }
  }, [hydrated, onboardingComplete, router]);

  // The core differentiator: Honza initiates. On load, if there's no thread yet,
  // generate an unprompted opening line (engine + user context + time of day)
  // and surface it here — the user never faces a blank screen (BUILD_SPEC §7,
  // and integration doctrine's "one honest seam": a real waiting message, not a
  // faked push notification).
  useEffect(() => {
    if (!hydrated || !onboardingComplete) return;
    if (messages.length > 0) return;
    void initiateOpener();
  }, [hydrated, onboardingComplete, messages.length]);

  const waiting = useMemo(
    () => [...messages].reverse().find((m) => m.role === "assistant") ?? null,
    [messages],
  );

  if (!hydrated || !onboardingComplete) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center font-sans text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  const initiating = status === "loading" && !waiting;

  return (
    <div className="flex min-h-[calc(100dvh-7rem)] flex-col items-center justify-center gap-8 px-2 text-center">
      <HonzaOrb state={mood} size="hero" className="shrink-0" />

      {initiating ? (
        <p className="font-sans text-sm tracking-[0.12em] text-muted-foreground">
          Honza is thinking about you…
        </p>
      ) : waiting ? (
        <Card className="w-full max-w-[min(360px,100%)] space-y-2 text-left">
          <SectionLabel>Honza wrote to you</SectionLabel>
          <p className="font-sans text-[15px] leading-relaxed text-foreground">
            {waiting.content}
          </p>
        </Card>
      ) : lastError ? (
        <div className="flex flex-col items-center gap-3">
          <p className="max-w-[min(320px,100%)] font-sans text-xs leading-relaxed text-accent">
            {lastError}
          </p>
          <button
            type="button"
            onClick={() => void initiateOpener()}
            className="font-sans text-[11px] uppercase tracking-[0.2em] text-muted-foreground underline transition hover:text-foreground"
          >
            Try again
          </button>
        </div>
      ) : (
        <p className="max-w-[min(320px,100%)] font-sans text-sm leading-relaxed tracking-[0.12em] text-foreground/85">
          Learn Czech through daily chat. Honza writes in Czech—you reply in Czech.
        </p>
      )}

      <div className="flex w-full max-w-[min(360px,100%)] flex-col gap-2">
        <button
          type="button"
          onClick={() => router.push(ROUTES.chat)}
          className="w-full rounded-full bg-accent py-3.5 font-sans text-xs font-medium uppercase tracking-[0.2em] text-white shadow-sm shadow-black/10 transition hover:opacity-90 active:scale-[0.98]"
        >
          {waiting ? "Reply to Honza" : "Open chat"}
        </button>
        {/* Speaking is the harder, more valuable rep — offer it next to typing
            rather than burying it in the tab bar. */}
        <button
          type="button"
          onClick={() => router.push(ROUTES.call)}
          className="w-full rounded-full border border-accent py-3.5 font-sans text-xs font-medium uppercase tracking-[0.2em] text-accent transition hover:bg-accent/5 active:scale-[0.98]"
        >
          Call Honza
        </button>
      </div>

      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="font-sans text-[11px] uppercase tracking-[0.2em] text-muted-foreground underline transition hover:text-foreground"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
