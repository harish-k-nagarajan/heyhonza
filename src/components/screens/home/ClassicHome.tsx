"use client";

import { HonzaOrb } from "@/components/honza/HonzaOrb";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { HomeScreen } from "@/hooks/useHomeScreen";

/**
 * Classic Home presentation — the shipped app, byte-for-byte. All behaviour now
 * comes from `useHomeScreen` (via `screen`); the markup is unchanged.
 */
export function ClassicHome({ screen }: { screen: HomeScreen }) {
  const { expression, waiting, initiating, lastError } = screen;

  if (!screen.ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center font-sans text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-7rem)] flex-col items-center justify-center gap-8 px-2 text-center">
      <HonzaOrb state={expression.mood} size="hero" className="shrink-0" />

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
            onClick={screen.retryOpener}
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
          onClick={screen.goChat}
          className="w-full rounded-full bg-accent py-3.5 font-sans text-xs font-medium uppercase tracking-[0.2em] text-white shadow-sm shadow-black/10 transition hover:opacity-90 active:scale-[0.98]"
        >
          {waiting ? "Reply to Honza" : "Open chat"}
        </button>
        {/* Speaking is the harder, more valuable rep — offer it next to typing
            rather than burying it in the tab bar. */}
        <button
          type="button"
          onClick={screen.goCall}
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
