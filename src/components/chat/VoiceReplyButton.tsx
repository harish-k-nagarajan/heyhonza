"use client";

import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type VoiceReplyButtonProps = {
  onTranscript: (text: string) => void;
  className?: string;
};

export function VoiceReplyButton({
  onTranscript,
  className,
}: VoiceReplyButtonProps) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<{ stop: () => void } | null>(null);

  const stop = useCallback(() => {
    recRef.current?.stop();
    recRef.current = null;
    setListening(false);
  }, []);

  const start = useCallback(() => {
    setError(null);
    if (typeof window === "undefined") return;
    const w = window as Window &
      typeof globalThis & {
        SpeechRecognition?: new () => unknown;
        webkitSpeechRecognition?: new () => unknown;
      };
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) {
      setError("Voice input is not supported in this browser.");
      return;
    }
    const rec = new SR() as {
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      start: () => void;
      stop: () => void;
      onresult: ((ev: {
        results: ArrayLike<{ 0?: { transcript?: string } }>;
      }) => void) | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
    };
    rec.lang = "cs-CZ";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (ev) => {
      const text = ev.results[0]?.[0]?.transcript?.trim();
      if (text) onTranscript(text);
      stop();
    };
    rec.onerror = () => {
      setError("Recognition failed. Try again.");
      stop();
    };
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
    };
    recRef.current = rec;
    setListening(true);
    rec.start();
  }, [onTranscript, stop]);

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <Button
        type="button"
        variant={listening ? "secondary" : "ghost"}
        className="min-h-11 min-w-11 rounded-full px-0"
        aria-pressed={listening}
        onClick={() => (listening ? stop() : start())}
        title="Voice reply (speech recognition)"
      >
        {listening ? "■" : "🎤"}
      </Button>
      {error ? (
        <span className="max-w-[200px] text-center text-xs text-accent">
          {error}
        </span>
      ) : null}
    </div>
  );
}
