"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * Web Speech API speech-to-text, defaulting to Czech (`cs-CZ`).
 *
 * Extracted from `VoiceReplyButton` (which was, and remains, the chat composer's
 * mic) so the call screen can reuse exactly the same recognition path instead of
 * growing a second copy of this glue. Behaviour is unchanged: one utterance per
 * `start()`, final results only.
 *
 * Browser support is the real constraint — this is Chrome/Edge/Safari, and
 * `supported` is false elsewhere, so callers must degrade rather than assume a
 * mic exists. Recognition also requires a user gesture and a granted mic
 * permission; both surface through `onError`.
 */

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous?: boolean;
  start: () => void;
  stop: () => void;
  abort?: () => void;
  onresult: ((ev: { results: ArrayLike<{ 0?: { transcript?: string } }> }) => void) | null;
  onerror: ((ev?: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window &
    typeof globalThis & {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Turn the spec's terse error codes into something a learner can act on. */
function messageForError(code: string | undefined): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone access is blocked. Allow it in your browser settings.";
    case "no-speech":
      return "I didn't catch that. Try again.";
    case "audio-capture":
      return "No microphone found.";
    case "network":
      return "Speech recognition needs a network connection.";
    case "aborted":
      return "";
    default:
      return "Recognition failed. Try again.";
  }
}

export type UseSpeechRecognitionOptions = {
  lang?: string;
  onResult: (text: string) => void;
  onError?: (message: string) => void;
};

export function useSpeechRecognition({
  lang = "cs-CZ",
  onResult,
  onError,
}: UseSpeechRecognitionOptions) {
  const [listening, setListening] = useState(false);
  const supported = useSyncExternalStore(
    () => () => {},
    () => getCtor() !== null,
    () => true,
  );
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  // Keep callbacks in refs so `start` stays stable and a re-render mid-utterance
  // can't strand a recognizer wired to a stale closure.
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onResultRef.current = onResult;
    onErrorRef.current = onError;
  }, [onResult, onError]);

  const stop = useCallback(() => {
    recRef.current?.stop();
    recRef.current = null;
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) {
      onErrorRef.current?.("Voice input is not supported in this browser.");
      return;
    }
    if (recRef.current) return; // already listening

    const rec = new Ctor();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (ev) => {
      const text = ev.results[0]?.[0]?.transcript?.trim();
      if (text) onResultRef.current(text);
      stop();
    };
    rec.onerror = (ev) => {
      const msg = messageForError(ev?.error);
      if (msg) onErrorRef.current?.(msg);
      stop();
    };
    rec.onend = () => {
      recRef.current = null;
      setListening(false);
    };
    recRef.current = rec;
    setListening(true);
    rec.start();
  }, [lang, stop]);

  // Navigating away mid-utterance must not leave the mic hot.
  useEffect(() => {
    return () => {
      recRef.current?.abort?.() ?? recRef.current?.stop();
      recRef.current = null;
    };
  }, []);

  return { listening, supported, start, stop };
}
