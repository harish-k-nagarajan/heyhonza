"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { useMoodExpression } from "@/hooks/useMoodExpression";
import { useProviderStatus } from "@/hooks/useProviderStatus";
import { useNeedsOnboarding, useScreenReady } from "@/hooks/useScreenReady";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useLocale } from "@/lib/i18n/useLocale";
import { callStatusLine, localizeClientError } from "@/lib/i18n/extended";
import { sendUserTurn, startCallOpener } from "@/lib/client/chat-actions";
import {
  applyCallAudioRoute,
  resetCallAudioRoute,
  setCallSpeakerPreference,
} from "@/lib/client/call-audio-route";
import {
  playDialSound,
  playHangupSound,
  playPickupSound,
  reapplyCallSfxRoute,
  stopAllCallSfx,
  stopDialSound,
  stopPickupSound,
} from "@/lib/client/call-sfx";
import {
  prepareSpeech,
  stopSpeaking,
  reapplyAudioRoute,
  type PreparedSpeech,
} from "@/lib/client/tts-actions";
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
  /** Matches chat: thinking overlay while connecting or awaiting Honza's reply. */
  orbLoading: boolean;
  /** Honza's orb face — aligned with chat (`loading ? thinking : expression.mood`). */
  orbState: HonzaOrbState;
  caption: string | null;
  captionWho: "honza" | "you";
  error: string | null;
  durationLabel: string;
  listening: boolean;
  supported: boolean;
  statusLine: string;
  llmReady: boolean;
  ttsReady: boolean;
  providersLoaded: boolean;
  startCall: () => void;
  endCall: (goToChat: boolean) => void;
  /** Toggle the mic: start listening if idle, stop if hot. */
  toggleMic: () => void;
  /** Toggle loudspeaker vs earpiece routing. */
  speakerOn: boolean;
  toggleSpeaker: () => void;
};

export function useCallScreen(): CallScreen {
  const router = useRouter();
  const ready = useScreenReady();
  const { t } = useLocale();
  const needsOnboarding = useNeedsOnboarding();
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);

  const design = useDesignStore((s) => s.design);
  const expression = useMoodExpression();
  const setMood = useMoodStore((s) => s.setMood);
  const { llmReady, ttsReady, loaded: providersLoaded } = useProviderStatus();

  const [phase, setPhase] = useState<CallPhase>("ready");
  const [caption, setCaption] = useState<string | null>(null);
  const [captionWho, setCaptionWho] = useState<"honza" | "you">("honza");
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [speakerOn, setSpeakerOn] = useState(false);

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
    if (needsOnboarding) router.replace(ROUTES.onboarding);
  }, [needsOnboarding, router]);

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
    async (text: string, preparedSpeech?: PreparedSpeech | null) => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const prepared =
          preparedSpeech ?? (await prepareSpeech(text, { signal: controller.signal }));
        if (!prepared || !activeRef.current || controller.signal.aborted) return;
        await prepared.play({
          signal: controller.signal,
          onStart: () => {
            if (!activeRef.current) return;
            setCaption(text);
            setCaptionWho("honza");
            setPhase("speaking");
          },
        });
      } catch (e) {
        if (controller.signal.aborted || !activeRef.current) return;
        setError(
          localizeClientError(
            e instanceof Error ? e.message : t.errors.unknownError,
            t.errors,
          ),
        );
      } finally {
        abortRef.current = null;
      }
      if (!activeRef.current) return;
      startListening();
    },
    [startListening, t.errors],
  );

  const handleTranscript = useCallback(
    (text: string) => {
      if (!activeRef.current) return;
      setPhase("thinking");
      void (async () => {
        const reply = await sendUserTurn(text, "call");
        if (!activeRef.current) return;
        if (!reply) {
          setError(
            localizeClientError(
              useChatStore.getState().lastError ?? t.errors.honzaNoReply,
              t.errors,
            ),
          );
          setPhase("listening");
          return;
        }
        setError(null);
        await speakThenListen(reply);
      })();
    },
    [speakThenListen, t.errors],
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
      stopDialSound();
      stopPickupSound();
      stop();
      playHangupSound();
      resetCallAudioRoute();
      setSpeakerOn(false);
      setPhase("ready");
      setCaption(null);
      setSeconds(0);
      setMood("idle");
      if (goToChat) router.push(ROUTES.chat);
    },
    [router, setMood, stop],
  );

  const startCall = useCallback(() => {
    if (!llmReady || !ttsReady) return;
    setError(null);
    setSeconds(0);
    setSpeakerOn(false);
    setCallSpeakerPreference(false);
    applyCallAudioRoute(false);
    activeRef.current = true;
    setPhase("connecting");
    void (async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      const openerPromise = startCallOpener();
      const speechPromise = openerPromise.then(async (opener) => {
        if (!opener || !activeRef.current || controller.signal.aborted) {
          return { opener, prepared: null as PreparedSpeech | null };
        }
        try {
          const prepared = await prepareSpeech(opener, { signal: controller.signal });
          return { opener, prepared };
        } catch {
          return { opener, prepared: null as PreparedSpeech | null };
        }
      });
      await playDialSound();
      if (!activeRef.current) return;
      const { opener, prepared } = await speechPromise;
      if (!activeRef.current) return;
      if (!opener) {
        setError(
          localizeClientError(
            useChatStore.getState().lastError ?? t.errors.couldNotReach,
            t.errors,
          ),
        );
        activeRef.current = false;
        setPhase("ready");
        return;
      }
      await playPickupSound();
      if (!activeRef.current) return;
      await speakThenListen(opener, prepared);
    })();
  }, [llmReady, ttsReady, speakThenListen, t.errors]);

  // Leaving mid-call must kill the mic and the audio, not leave them running.
  useEffect(() => {
    return () => {
      activeRef.current = false;
      abortRef.current?.abort();
      stopSpeaking();
      stopAllCallSfx();
      resetCallAudioRoute();
      setMood("idle");
    };
  }, [setMood]);

  const toggleMic = useCallback(() => {
    if (listening) stop();
    else startListening();
  }, [listening, stop, startListening]);

  const toggleSpeaker = useCallback(() => {
    setSpeakerOn((prev) => {
      const next = !prev;
      setCallSpeakerPreference(next);
      applyCallAudioRoute(next);
      void reapplyAudioRoute();
      void reapplyCallSfxRoute();
      return next;
    });
  }, []);

  const orbLoading = phase === "connecting" || phase === "thinking";
  const orbState: HonzaOrbState = orbLoading ? "thinking" : expression.mood;

  const statusLine = callStatusLine(phase, listening, t.call);

  return {
    ready: ready && onboardingComplete,
    design,
    family: DESIGNS[design].family,
    expression,
    phase,
    inCall,
    orbLoading,
    orbState,
    caption,
    captionWho,
    error,
    durationLabel: formatDuration(seconds),
    listening,
    supported,
    statusLine,
    llmReady,
    ttsReady,
    providersLoaded,
    startCall,
    endCall,
    toggleMic,
    speakerOn,
    toggleSpeaker,
  };
}
