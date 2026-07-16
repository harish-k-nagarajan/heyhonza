"use client";

import { HonzaOrb } from "@/components/honza/HonzaOrb";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import type { CallScreen } from "@/hooks/useCallScreen";

/**
 * Classic Call presentation — the shipped app, byte-for-byte. The turn cycle,
 * mic, and duration clock now live in `useCallScreen` (via `screen`); the markup
 * is unchanged.
 */
export function ClassicCall({ screen }: { screen: CallScreen }) {
  const { phase, inCall, orbState, caption, captionWho, error, listening, supported } =
    screen;

  if (!screen.ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-9rem)] flex-col gap-4">
      <header className="flex shrink-0 items-center justify-between">
        <SectionLabel>{inCall ? "Live call" : "Call Honza"}</SectionLabel>
        {inCall ? (
          <span
            className="font-sans text-xs tabular-nums text-muted-foreground"
            aria-label="Call duration"
          >
            {screen.durationLabel}
          </span>
        ) : null}
      </header>

      {/* The character leads the screen — hero scale, never an inline avatar. */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="relative">
          <HonzaOrb state={orbState} size="hero" />
          {/* A soft ring while the mic is hot: the one moment the learner needs
              to know the app is hearing them. */}
          {phase === "listening" && listening ? (
            <span
              className="pointer-events-none absolute -inset-3 rounded-[20px] border-2 border-accent motion-safe:animate-honza-thinking motion-reduce:animate-none"
              aria-hidden
            />
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-lg tracking-[0.2em]">HONZA</h1>
          <p
            className="font-sans text-xs text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            {screen.statusLine}
          </p>
        </div>

        {/* Live caption — the last line spoken, by either side. Not a thread:
            one line at a time, because you're listening, not reading. */}
        {caption ? (
          <Card className="w-full max-w-[340px] p-3">
            <SectionLabel as="p" className="mb-1 text-[9px]">
              {captionWho === "honza" ? "Honza" : "You"}
            </SectionLabel>
            <p className="text-sm leading-relaxed">{caption}</p>
          </Card>
        ) : null}

        {error ? (
          <p className="max-w-[320px] font-sans text-xs text-accent">{error}</p>
        ) : null}

        {!supported && !inCall ? (
          <p className="max-w-[320px] font-sans text-xs text-muted-foreground">
            Speech recognition needs Chrome, Edge or Safari. In other browsers,
            use{" "}
            <a href={ROUTES.chat} className="text-accent underline">
              Chat
            </a>{" "}
            instead.
          </p>
        ) : null}
      </div>

      {/* Call controls, thumb-reachable at the bottom of the phone stage. */}
      <div className="flex shrink-0 flex-col items-center gap-3 pb-2">
        {!inCall ? (
          <Button
            type="button"
            className="min-h-14 w-full max-w-[280px] text-base tracking-[0.2em]"
            onClick={screen.startCall}
            disabled={!supported}
          >
            CALL HONZA
          </Button>
        ) : (
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={screen.toggleMic}
              disabled={phase === "connecting" || phase === "thinking"}
              aria-pressed={listening}
              aria-label={listening ? "Stop speaking" : "Speak"}
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-full border-2 text-xl transition active:scale-95 disabled:opacity-40",
                listening
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-accent bg-card text-accent",
              )}
            >
              {listening ? "■" : "🎤"}
            </button>
            <button
              type="button"
              onClick={() => screen.endCall(true)}
              aria-label="End call"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C2185B] text-xl text-white transition active:scale-95"
            >
              ✕
            </button>
          </div>
        )}
        {inCall ? (
          <span className="font-sans text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
            End call → transcript in Chat
          </span>
        ) : null}
      </div>
    </div>
  );
}
