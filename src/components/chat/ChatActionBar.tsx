"use client";

import { useCallback, useState } from "react";

import { HardwareIcon } from "@/components/icons/HardwareIcons";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/i18n/useLocale";
import { DESIGNS } from "@/lib/design/registry";
import { useDesignStore } from "@/stores/useDesignStore";

/**
 * Chat footer: idle shows Start Chat; active shows composer + Send + End Chat
 * with a small split animation when the session begins.
 */
export function ChatActionBar({
  chatPhase,
  onStartChat,
  onSend,
  onEndChat,
  disabled,
}: {
  chatPhase: "idle" | "active";
  onStartChat: () => void;
  onSend: (text: string) => void;
  onEndChat: () => void;
  disabled?: boolean;
}) {
  const { t } = useLocale();
  const isHmat = DESIGNS[useDesignStore((s) => s.design)].family === "hmat";
  const [value, setValue] = useState("");
  const empty = value.trim().length === 0;

  const submit = useCallback(() => {
    const text = value.trim();
    if (!text || disabled) return;
    setValue("");
    onSend(text);
  }, [disabled, onSend, value]);

  if (chatPhase === "idle") {
    return (
      <div className="mt-3 shrink-0">
        <button
          type="button"
          onClick={onStartChat}
          disabled={disabled}
          className={cn(
            "w-full transition-all duration-300 motion-reduce:transition-none",
            isHmat
              ? "mat-key press rounded-full py-3.5 font-display text-xs uppercase tracking-[0.2em] text-accent disabled:opacity-50"
              : "rounded-full bg-accent py-3.5 font-sans text-xs uppercase tracking-[0.2em] text-accent-foreground transition hover:opacity-90 disabled:opacity-50",
          )}
        >
          {t.chat.startChat}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 flex shrink-0 flex-col gap-2.5 transition-all duration-300 motion-reduce:transition-none">
      <div className="flex items-center gap-2.5">
        <div className={cn("relative flex-1", isHmat ? "mat-field" : "rounded-full border-2 border-accent bg-card px-4 py-2")}>
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
            aria-label={t.chat.send}
            className={cn(
              "w-full bg-transparent font-sans text-[15px] text-foreground outline-none disabled:opacity-50",
              isHmat ? "rounded-full px-[18px] py-3.5" : "text-sm tracking-[0.06em]",
            )}
          />
          {empty ? (
            <span
              className="pointer-events-none absolute inset-y-0 left-[18px] flex items-center font-sans text-[15px] text-muted-foreground"
              aria-hidden
            >
              {isHmat ? (
                <>
                  Odpověz česky<span className="text-accent">_</span>
                </>
              ) : (
                "Reply in Czech…"
              )}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={disabled || empty}
          aria-label={t.chat.send}
          className={cn(
            "flex shrink-0 items-center justify-center transition-all duration-300 motion-reduce:transition-none",
            isHmat
              ? "mat-key press h-[52px] w-[52px] rounded-full text-accent disabled:opacity-40"
              : "rounded-full bg-accent px-4 py-3 font-sans text-xs uppercase tracking-[0.16em] text-accent-foreground disabled:opacity-40",
          )}
        >
          {isHmat ? (
            <HardwareIcon name="send" size={22} />
          ) : (
            t.chat.send
          )}
        </button>
      </div>
      <button
        type="button"
        onClick={onEndChat}
        disabled={disabled}
        className={cn(
          "w-full py-2 font-sans text-[11px] uppercase tracking-[0.18em] text-muted-foreground underline transition hover:text-foreground disabled:opacity-50",
          isHmat && "font-display text-[10px] tracking-[0.2em]",
        )}
      >
        {t.chat.endChat}
      </button>
    </div>
  );
}
