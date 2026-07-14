"use client";

import { useCallback, useState } from "react";

import { VoiceReplyButton } from "@/components/chat/VoiceReplyButton";
import { cn } from "@/lib/cn";

type ComposerProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

export function Composer({ onSend, disabled }: ComposerProps) {
  const [value, setValue] = useState("");

  const submit = useCallback(() => {
    const t = value.trim();
    if (!t || disabled) return;
    setValue("");
    onSend(t);
  }, [disabled, onSend, value]);

  const empty = value.length === 0;

  return (
    <div className="flex items-center gap-2">
      <VoiceReplyButton
        className="shrink-0"
        onTranscript={(text) => {
          setValue("");
          onSend(text);
        }}
      />

      {/* Pill field with accent border and a blinking-cursor placeholder. */}
      <div className="relative flex-1">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          disabled={disabled}
          aria-label="Reply in Czech"
          className="h-11 w-full rounded-full border-2 border-accent bg-card px-4 text-sm text-foreground outline-none ring-accent/30 focus:ring-2 disabled:opacity-50"
        />
        {empty ? (
          <span
            className="pointer-events-none absolute inset-y-0 left-4 flex items-center font-sans text-xs uppercase tracking-[0.15em] text-muted-foreground"
            aria-hidden
          >
            Reply in Czech
            <span className="ml-0.5 animate-blink motion-reduce:animate-none">
              _
            </span>
          </span>
        ) : null}
      </div>

      {/* Filled circular send. */}
      <button
        type="button"
        onClick={submit}
        disabled={disabled || empty}
        aria-label="Send reply"
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-sm shadow-black/10 transition active:scale-[0.95]",
          "disabled:pointer-events-none disabled:opacity-40",
        )}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 19V5" />
          <path d="m5 12 7-7 7 7" />
        </svg>
      </button>
    </div>
  );
}
