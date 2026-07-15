"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { cn } from "@/lib/cn";

/**
 * The chat composer's mic: one spoken Czech utterance, transcribed into the
 * composer's send path. Recognition itself lives in `useSpeechRecognition`,
 * shared with the call screen.
 *
 * This is the *typed* surface's shortcut — a spoken turn here is still a chat
 * turn. For a real spoken conversation (Honza talks back), that's `/call`.
 */

type VoiceReplyButtonProps = {
  onTranscript: (text: string) => void;
  className?: string;
};

export function VoiceReplyButton({
  onTranscript,
  className,
}: VoiceReplyButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const { listening, supported, start, stop } = useSpeechRecognition({
    onResult: (text) => {
      setError(null);
      onTranscript(text);
    },
    onError: setError,
  });

  if (!supported) return null;

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <Button
        type="button"
        variant={listening ? "secondary" : "ghost"}
        className="min-h-11 min-w-11 rounded-full px-0"
        aria-pressed={listening}
        aria-label={listening ? "Stop listening" : "Voice reply in Czech"}
        onClick={() => {
          setError(null);
          listening ? stop() : start();
        }}
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
