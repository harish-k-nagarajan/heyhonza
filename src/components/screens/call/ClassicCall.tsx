"use client";

import { useEffect, useRef } from "react";

import { HonzaOrb } from "@/components/honza/HonzaOrb";
import { MoodOrbStrip } from "@/components/honza/MoodOrbStrip";
import { HardwareIcon } from "@/components/icons/HardwareIcons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import type { CallScreen } from "@/hooks/useCallScreen";
import { useMoodReactions } from "@/hooks/useMoodReactions";
import { useReactPop } from "@/hooks/useReactPop";
import { tapLight, tapMedium } from "@/lib/interaction/haptic";

/**
 * Classic Call presentation — shared behaviour from `useCallScreen`; markup
 * updated for hardware icons, react-pop, and mood strip (Classic keeps flat chrome).
 */
export function ClassicCall({ screen }: { screen: CallScreen }) {
  const { phase, inCall, orbState, caption, captionWho, error, listening, supported } =
    screen;
  const { stackClassName, triggerPop } = useReactPop();
  const wasInCallRef = useRef(false);

  useMoodReactions(triggerPop);

  useEffect(() => {
    if (inCall && !wasInCallRef.current) {
      tapMedium();
      triggerPop();
    }
    wasInCallRef.current = inCall;
  }, [inCall, triggerPop]);

  if (!screen.ready) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <HonzaOrb state="idle" size="avatar" />
        <div className="h-3 w-24 animate-pulse rounded-full bg-muted" aria-hidden />
        <p className="font-sans text-sm text-muted-foreground">Loading…</p>
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

      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="relative">
          <div className="rounded-full" aria-hidden>
            <HonzaOrb state={orbState} size="hero" stackClassName={stackClassName} />
          </div>
          {phase === "listening" && listening ? (
            <span
              className="pointer-events-none absolute -inset-3 rounded-[20px] border-2 border-accent motion-safe:animate-honza-thinking motion-reduce:animate-none"
              aria-hidden
            />
          ) : null}
        </div>

        <MoodOrbStrip
          expression={screen.expression}
          thinkingLabel="Ringing…"
          showChannel={false}
          className="max-w-[240px]"
        />

        <p
          className="font-sans text-xs text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          {screen.statusLine}
        </p>

        {caption ? (
          <Card className="w-full max-w-[340px] p-3 motion-safe:animate-message-in motion-reduce:animate-none">
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

      <div className="flex shrink-0 flex-col items-center gap-3 pb-2">
        {!inCall ? (
          <Button
            type="button"
            className="min-h-14 w-full max-w-[280px] text-base tracking-[0.2em]"
            onClick={() => {
              tapMedium();
              screen.startCall();
            }}
            disabled={!supported}
          >
            CALL HONZA
          </Button>
        ) : (
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                tapLight();
                screen.toggleMic();
              }}
              disabled={phase === "connecting" || phase === "thinking"}
              aria-pressed={listening}
              aria-label={listening ? "Stop speaking" : "Speak"}
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-full border-2 transition active:scale-95 disabled:opacity-40",
                listening
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-accent bg-card text-accent",
              )}
            >
              <HardwareIcon name="mic" size={26} emboss={!listening} />
            </button>
            <button
              type="button"
              onClick={() => {
                tapLight();
                screen.endCall(true);
              }}
              aria-label="End call"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C2185B] text-white transition active:scale-95"
            >
              <HardwareIcon name="hang" size={26} emboss={false} />
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
