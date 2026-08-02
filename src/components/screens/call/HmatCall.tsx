"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/Button";
import { HonzaOrbBackdrop } from "@/components/honza/HonzaOrbBackdrop";
import { HmatOrb } from "@/components/honza/HmatOrb";
import { MoodOrbStrip } from "@/components/honza/MoodOrbStrip";
import { HardwareIcon } from "@/components/icons/HardwareIcons";
import { HmatScreenLoading } from "@/components/screens/hmat/HmatChrome";
import type { CallScreen } from "@/hooks/useCallScreen";
import { useMoodReactions } from "@/hooks/useMoodReactions";
import { useReactPop } from "@/hooks/useReactPop";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import { tapLight, tapMedium } from "@/lib/interaction/haptic";

function czStatusLine(phase: CallScreen["phase"], listening: boolean): string {
  switch (phase) {
    case "ready":
      return "Klepni a zavolej — budeš mluvit česky, Honza ti odpoví nahlas.";
    case "connecting":
      return "Vyzvání…";
    case "speaking":
      return "Honza mluví…";
    case "listening":
      return listening ? "Poslouchám… mluv česky" : "Klepni na mikrofon a odpověz";
    case "thinking":
      return "Honza přemýšlí…";
    default: {
      const _exhaustive: never = phase;
      return _exhaustive;
    }
  }
}

export function HmatCall({ screen }: { screen: CallScreen }) {
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

  if (!screen.ready) return <HmatScreenLoading />;

  const channelPulse = phase === "speaking" || orbState === "excited";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center justify-center">
        {inCall ? (
          <span className="mat rounded-full px-4 py-1.5" aria-label="Call duration">
            <span className={cn(TYPE.meta, "text-accent tabular-nums")}>
              {screen.durationLabel}
            </span>
          </span>
        ) : (
          <span className={cn(TYPE.label, "text-muted-foreground")}>Hovor s Honzou</span>
        )}
      </header>

      <div className="mat-recess relative mt-6 overflow-hidden flex flex-col items-center px-4 py-8">
        <HonzaOrbBackdrop state={orbState} />
        <button
          type="button"
          onClick={() => {
            tapLight();
            triggerPop();
          }}
          className="relative z-[1] rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          aria-label="Honza"
        >
          <HmatOrb state={orbState} size={172} stackClassName={stackClassName} />
        </button>
        <MoodOrbStrip
          expression={screen.expression}
          thinkingLabel="Vyzvání…"
          channelPulse={channelPulse}
          className="relative z-[1] mt-5 w-full"
        />
      </div>

      <p className={cn("mt-4 text-center", TYPE.helper)} role="status" aria-live="polite">
        {czStatusLine(phase, listening)}
      </p>

      {caption ? (
        <div className="mat mat-tilt mx-auto mt-5 w-full max-w-[340px] px-4 py-3 motion-safe:animate-message-in motion-reduce:animate-none">
          <p className={cn("mb-1", TYPE.kicker, "text-muted-foreground")}>
            {captionWho === "honza" ? "Honza" : "Ty"}
          </p>
          <p className={cn(TYPE.bodySm, "text-foreground")}>{caption}</p>
        </div>
      ) : null}

      {error ? (
        <p className={cn("mx-auto mt-4 max-w-[320px] text-center", TYPE.helper, "text-accent")}>
          {error}
        </p>
      ) : null}

      {!supported && !inCall ? (
        <p className={cn("mx-auto mt-4 max-w-[320px] text-center", TYPE.helper)}>
          Rozpoznávání řeči potřebuje Chrome, Edge nebo Safari. Jinde použij{" "}
          <a href={ROUTES.chat} className="text-accent underline">
            Chat
          </a>
          .
        </p>
      ) : null}

      <div className="flex-1" />

      <div className="flex shrink-0 flex-col items-center gap-3">
        {!inCall ? (
          <Button
            type="button"
            surface="mat-key"
            shape="pill"
            size="call"
            haptic="medium"
            onClick={() => {
              screen.startCall();
            }}
            disabled={!supported}
          >
            ZAVOLAT
          </Button>
        ) : (
          <div className="flex items-center gap-5">
            <Button
              type="button"
              surface="mat-key"
              shape="circle"
              size="icon-lg"
              onClick={() => {
                screen.toggleMic();
              }}
              disabled={phase === "connecting" || phase === "thinking"}
              aria-pressed={listening}
              aria-label={listening ? "Stop speaking" : "Speak"}
              className={listening ? "text-white" : undefined}
              style={
                listening
                  ? {
                      background:
                        "linear-gradient(180deg, color-mix(in srgb, var(--accent) 96%, #fff), var(--accent))",
                    }
                  : undefined
              }
            >
              <HardwareIcon name="mic" size={24} emboss={!listening} />
            </Button>
            <Button
              type="button"
              surface="mat-key"
              shape="circle"
              size="icon-lg"
              variant="danger"
              onClick={() => {
                screen.endCall(true);
              }}
              aria-label="End call"
              style={{ background: "linear-gradient(180deg, #ef5b60, #E5484D)" }}
            >
              <HardwareIcon name="hang" size={24} emboss={false} />
            </Button>
          </div>
        )}
        {inCall ? (
          <span className={cn(TYPE.kicker, "text-muted-foreground")}>
            Zavěsit → přepis v Chatu
          </span>
        ) : null}
      </div>
    </div>
  );
}
