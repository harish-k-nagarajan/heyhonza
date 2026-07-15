"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { HonzaOrb } from "@/components/honza/HonzaOrb";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSettingsHydrated } from "@/hooks/useSettingsHydrated";
import { sendUserTurn, startCallOpener } from "@/lib/client/chat-actions";
import { speak, stopSpeaking } from "@/lib/client/tts-actions";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { useChatStore } from "@/stores/useChatStore";
import { useMoodStore } from "@/stores/useMoodStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useSyncStore } from "@/stores/useSyncStore";

/**
 * The call screen (BUILD_SPEC Phase 8).
 *
 * Deliberately *not* a text thread with a mic bolted on: Honza's face fills the
 * screen, there are no bubbles, and the only text is a live caption of the last
 * thing either of you said. The turn cycle — he speaks, you speak, repeat —
 * drives itself, the way a phone call does; you don't press send.
 *
 * Every turn still goes through the same `/api/chat` path as typed chat, tagged
 * `kind:'call'`, so hanging up leaves the whole exchange in your normal history.
 */

type CallPhase =
  | "ready" // not started — Honza hasn't picked up
  | "connecting" // fetching his opener
  | "speaking" // Honza is audibly talking
  | "listening" // mic is hot
  | "thinking"; // your turn is in flight

/** Honza's face state for each phase of the call. */
const MOOD_FOR_PHASE = {
  ready: "idle",
  connecting: "thinking",
  speaking: "speaking",
  listening: "idle",
  thinking: "thinking",
} as const;

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function CallClient() {
  const router = useRouter();
  const localHydrated = useSettingsHydrated();
  const serverChecked = useSyncStore((s) => s.checked);
  const hydrated = localHydrated && serverChecked;
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);

  const setMood = useMoodStore((s) => s.setMood);

  const [phase, setPhase] = useState<CallPhase>("ready");
  const [caption, setCaption] = useState<string | null>(null);
  const [captionWho, setCaptionWho] = useState<"honza" | "you">("honza");
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);

  // `phase` in a ref: the speak→listen→send cycle is driven by callbacks that
  // outlive the render they were created in, and they must not act on a call
  // that has already been hung up.
  const activeRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const inCall = phase !== "ready";

  useEffect(() => {
    setMood(MOOD_FOR_PHASE[phase]);
  }, [phase, setMood]);

  useEffect(() => {
    if (hydrated && !onboardingComplete) router.replace(ROUTES.onboarding);
  }, [hydrated, onboardingComplete, router]);

  // Call duration — the single strongest "this is a call, not a chat" signal.
  useEffect(() => {
    if (!inCall) return;
    const t = window.setInterval(() => setSeconds((n) => n + 1), 1000);
    return () => window.clearInterval(t);
  }, [inCall]);

  // The turn cycle is inherently circular — recognition triggers a reply, which
  // triggers recognition again — so the handler is reached through a ref. That
  // breaks the cycle at one clearly-marked point instead of leaving a
  // forward-reference for a later reader to trip over.
  const handleTranscriptRef = useRef<(text: string) => void>(() => {});

  const { listening, supported, start, stop } = useSpeechRecognition({
    onResult: (text) => handleTranscriptRef.current(text),
    onError: (msg) => {
      setError(msg);
      // A failed utterance shouldn't hang up — go back to waiting for the user.
      if (activeRef.current) setPhase("listening");
    },
  });

  const startListening = useCallback(() => {
    if (!activeRef.current) return;
    setPhase("listening");
    start();
  }, [start]);

  /** Speak one of Honza's lines, then hand the turn back to the learner. */
  const speakThenListen = useCallback(
    async (text: string) => {
      setCaption(text);
      setCaptionWho("honza");
      setPhase("speaking");
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        await speak(text, { signal: controller.signal });
      } catch (e) {
        // A mute Honza shouldn't end the call — his line is still on screen,
        // so degrade to a readable call rather than a dead one.
        setError(e instanceof Error ? e.message : "Honza's voice is unavailable.");
      } finally {
        abortRef.current = null;
      }
      if (!activeRef.current) return;
      startListening();
    },
    [startListening],
  );

  const handleTranscript = useCallback(
    (text: string) => {
      if (!activeRef.current) return;
      setCaption(text);
      setCaptionWho("you");
      setPhase("thinking");
      void (async () => {
        const reply = await sendUserTurn(text, "call");
        if (!activeRef.current) return;
        if (!reply) {
          setError(useChatStore.getState().lastError ?? "Honza didn't reply.");
          setPhase("listening");
          return;
        }
        setError(null);
        await speakThenListen(reply);
      })();
    },
    [speakThenListen],
  );

  useEffect(() => {
    handleTranscriptRef.current = handleTranscript;
  }, [handleTranscript]);

  const endCall = useCallback(
    (goToChat: boolean) => {
      activeRef.current = false;
      abortRef.current?.abort();
      abortRef.current = null;
      stopSpeaking();
      stop();
      setPhase("ready");
      setCaption(null);
      setSeconds(0);
      setMood("idle");
      // Hanging up hands you to the transcript — the call *was* real, and the
      // proof is that it's now sitting in your history like any other turn.
      if (goToChat) router.push(ROUTES.chat);
    },
    [router, setMood, stop],
  );

  const startCall = useCallback(() => {
    setError(null);
    setSeconds(0);
    activeRef.current = true;
    setPhase("connecting");
    void (async () => {
      const opener = await startCallOpener();
      if (!activeRef.current) return;
      if (!opener) {
        setError(useChatStore.getState().lastError ?? "Couldn't reach Honza.");
        activeRef.current = false;
        setPhase("ready");
        return;
      }
      await speakThenListen(opener);
    })();
  }, [speakThenListen]);

  // Leaving mid-call must kill the mic and the audio, not leave them running.
  useEffect(() => {
    return () => {
      activeRef.current = false;
      abortRef.current?.abort();
      stopSpeaking();
      setMood("idle");
    };
  }, [setMood]);

  if (!hydrated || !onboardingComplete) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  const statusLine =
    phase === "ready"
      ? "Tap to call — you'll speak Czech, he'll answer out loud."
      : phase === "connecting"
        ? "Ringing…"
        : phase === "speaking"
          ? "Honza is speaking…"
          : phase === "listening"
            ? listening
              ? "Listening… speak Czech"
              : "Tap the mic to answer"
            : "Honza is thinking…";

  return (
    <div className="flex min-h-[calc(100dvh-9rem)] flex-col gap-4">
      <header className="flex shrink-0 items-center justify-between">
        <SectionLabel>{inCall ? "Live call" : "Call Honza"}</SectionLabel>
        {inCall ? (
          <span
            className="font-sans text-xs tabular-nums text-muted-foreground"
            aria-label="Call duration"
          >
            {formatDuration(seconds)}
          </span>
        ) : null}
      </header>

      {/* The character leads the screen — hero scale, never an inline avatar. */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="relative">
          <HonzaOrb state={MOOD_FOR_PHASE[phase]} size="hero" />
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
            {statusLine}
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
            onClick={startCall}
            disabled={!supported}
          >
            CALL HONZA
          </Button>
        ) : (
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => (listening ? stop() : startListening())}
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
              onClick={() => endCall(true)}
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
