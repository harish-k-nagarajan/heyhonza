"use client";

import { HmatOrb } from "@/components/honza/HmatOrb";
import { HardwareIcon } from "@/components/icons/HardwareIcons";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import type { CallScreen } from "@/hooks/useCallScreen";
import { HmatScreenLoading } from "@/components/screens/hmat/HmatChrome";

/**
 * Hmat Call — a real call, not a chat with a mic. Honza fills a machined recess,
 * the lit channel and orb backlight ride the mood energy, and the controls are
 * deep keys (mic = in-call mute, hang = red). Behaviour + the speak→listen→send
 * turn cycle come from `useCallScreen`; hanging up drops you into the transcript.
 */
export function HmatCall({ screen }: { screen: CallScreen }) {
  const { phase, inCall, orbState, caption, captionWho, error, listening, supported } =
    screen;

  if (!screen.ready) return <HmatScreenLoading />;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header: duration pill mid-call, label otherwise. */}
      <header className="flex shrink-0 items-center justify-center">
        {inCall ? (
          <span className="mat rounded-full px-4 py-1.5" aria-label="Call duration">
            <span className="font-display text-[11px] tracking-[0.14em] text-accent tabular-nums">
              {screen.durationLabel}
            </span>
          </span>
        ) : (
          <span className="font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Hovor s Honzou
          </span>
        )}
      </header>

      {/* Character in the recess. */}
      <div className="mat-recess mt-6 flex flex-col items-center px-4 py-8">
        <HmatOrb state={orbState} size={172} />
        <div className="mat-channel mt-5" style={{ width: "56%" }} aria-hidden />
        <p className="mt-3.5 font-display text-[10px] uppercase tracking-[0.18em] text-accent">
          {screen.expression.czLabel}
        </p>
      </div>

      <div className="mt-6 flex flex-col items-center gap-1 text-center">
        <h1 className="font-display text-lg tracking-[0.2em]">HONZA</h1>
        <p
          className="font-sans text-xs text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          {screen.statusLine}
        </p>
      </div>

      {caption ? (
        <div className="mat mx-auto mt-5 w-full max-w-[340px] px-4 py-3">
          <p className="mb-1 font-display text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
            {captionWho === "honza" ? "Honza" : "Ty"}
          </p>
          <p className="font-sans text-sm leading-relaxed text-foreground">{caption}</p>
        </div>
      ) : null}

      {error ? (
        <p className="mx-auto mt-4 max-w-[320px] text-center font-sans text-xs text-accent">
          {error}
        </p>
      ) : null}

      {!supported && !inCall ? (
        <p className="mx-auto mt-4 max-w-[320px] text-center font-sans text-xs text-muted-foreground">
          Rozpoznávání řeči potřebuje Chrome, Edge nebo Safari. Jinde použij{" "}
          <a href={ROUTES.chat} className="text-accent underline">
            Chat
          </a>
          .
        </p>
      ) : null}

      <div className="flex-1" />

      {/* Controls. */}
      <div className="flex shrink-0 flex-col items-center gap-3">
        {!inCall ? (
          <button
            type="button"
            onClick={screen.startCall}
            disabled={!supported}
            className="mat-key press flex h-14 w-full max-w-[280px] items-center justify-center rounded-full font-display text-base tracking-[0.2em] text-accent disabled:opacity-40"
          >
            ZAVOLAT
          </button>
        ) : (
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={screen.toggleMic}
              disabled={phase === "connecting" || phase === "thinking"}
              aria-pressed={listening}
              aria-label={listening ? "Stop speaking" : "Speak"}
              className={cn(
                "mat-key press flex h-[60px] w-[60px] items-center justify-center rounded-full disabled:opacity-40",
                listening ? "text-white" : "text-accent",
              )}
              style={
                listening
                  ? { background: "linear-gradient(180deg, color-mix(in srgb, var(--accent) 96%, #fff), var(--accent))" }
                  : undefined
              }
            >
              <HardwareIcon name="mic" size={24} emboss={!listening} />
            </button>
            <button
              type="button"
              onClick={() => screen.endCall(true)}
              aria-label="End call"
              className="mat-key press flex h-[60px] w-[60px] items-center justify-center rounded-full text-white"
              style={{ background: "linear-gradient(180deg, #ef5b60, #E5484D)" }}
            >
              <HardwareIcon name="hang" size={24} emboss={false} />
            </button>
          </div>
        )}
        {inCall ? (
          <span className="font-display text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Zavěsit → přepis v Chatu
          </span>
        ) : null}
      </div>
    </div>
  );
}
