"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { useMoodExpression } from "@/hooks/useMoodExpression";
import { useScreenReady } from "@/hooks/useScreenReady";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { sendUserTurn, startCallOpener } from "@/lib/client/chat-actions";
import { speak, stopSpeaking } from "@/lib/client/tts-actions";
import { ROUTES } from "@/lib/constants";
import { DESIGNS } from "@/lib/design/registry";
import type { DesignFamily, DesignId } from "@/lib/design/registry";
import type { HonzaOrbState } from "@/components/honza/theme";
import type { MoodExpression } from "@/lib/mood/expression";
import { useChatStore } from "@/stores/useChatStore";
import { useDesignStore } from "@/stores/useDesignStore";
import { useMoodStore } from "@/stores/useMoodStore";
import { useSettingsStore } from "@/stores/useSettingsStore";

/**
 * Behaviour for the Call surface (BUILD_SPEC Phase 8), extracted so a design is
 * pure presentation. Owns the speak → listen → send turn cycle, the mic, the
 * duration clock, and cleanup on hang-up / unmount. Every turn still goes
 * through the same `/api/chat` path as typed chat, tagged `kind:'call'`.
 */

export type CallPhase =
  | "ready" // not started — Honza hasn't picked up
  | "connecting" // fetching his opener
  | "speaking" // Honza is audibly talking
  | "listening" // mic is hot
  | "thinking"; // your turn is in flight

/** Honza's face state for each phase of the call. */
const MOOD_FOR_PHASE: Record<CallPhase, HonzaOrbState> = {
  ready: "idle",
  connecting: "thinking",
  speaking: "speaking",
  listening: "idle",
  thinking: "thinking",
};

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export type CallScreen = {
  ready: boolean;
  design: DesignId;
  family: DesignFamily;
  expression: MoodExpression;
  phase: CallPhase;
  inCall: boolean;
  /** Honza's orb state for the current phase. */
  orbState: HonzaOrbState;
  caption: string | null;
  captionWho: "honza" | "you";
  error: string | null;
  durationLabel: string;
  listening: boolean;
  supported: boolean;
  statusLine: string;
  startCall: () => void;
  endCall: (goToChat: boolean) => void;
  /** Toggle the mic: start listening if idle, stop if hot. */
  toggleMic: () => void;
  /** Show live transcript panel (speaker toggle in handoff). */
  captionsVisible: boolean;
  toggleCaptions: () => void;
};

export function useCallScreen(): CallScreen {
  const router = useRouter();
  const ready = useScreenReady();
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);

  const design = useDesignStore((s) => s.design);
  const expression = useMoodExpression();
  const setMood = useMoodStore((s) => s.setMood);

  const [phase, setPhase] = useState<CallPhase>("ready");
  const [caption, setCaption] = useState<string | null>(null);
  const [captionWho, setCaptionWho] = useState<"honza" | "you">("honza");
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [captionsVisible, setCaptionsVisible] = useState(false);

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
    if (ready && !onboardingComplete) router.replace(ROUTES.onboarding);
  }, [ready, onboardingComplete, router]);

  // Call duration — the single strongest "this is a call, not a chat" signal.
  useEffect(() => {
    if (!inCall) return;
    const t = window.setInterval(() => setSeconds((n) => n + 1), 1000);
    return () => window.clearInterval(t);
  }, [inCall]);

  // The turn cycle is inherently circular — recognition triggers a reply, which
  // triggers recognition again — so the handler is reached through a ref.
  const handleTranscriptRef = useRef<(text: string) => void>(() => {});

  const { listening, supported, start, stop } = useSpeechRecognition({
    onResult: (text) => handleTranscriptRef.current(text),
    onError: (msg) => {
      setError(msg);
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

  const toggleMic = useCallback(() => {
    if (listening) stop();
    else startListening();
  }, [listening, stop, startListening]);

  const toggleCaptions = useCallback(() => {
    setCaptionsVisible((v) => !v);
  }, []);

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

  return {
    ready: ready && onboardingComplete,
    design,
    family: DESIGNS[design].family,
    expression,
    phase,
    inCall,
    orbState: MOOD_FOR_PHASE[phase],
    caption,
    captionWho,
    error,
    durationLabel: formatDuration(seconds),
    listening,
    supported,
    statusLine,
    startCall,
    endCall,
    toggleMic,
    captionsVisible,
    toggleCaptions,
  };
}
