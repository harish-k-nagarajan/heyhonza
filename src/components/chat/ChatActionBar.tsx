"use client";

import { useCallback, useState } from "react";

import { HardwareIcon } from "@/components/icons/HardwareIcons";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/i18n/useLocale";
import { tapLight, tapMedium } from "@/lib/interaction/haptic";
import { DESIGNS } from "@/lib/design/registry";
import { useDesignStore } from "@/stores/useDesignStore";

function SendArrowIcon() {
  return (
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
  );
}

/**
 * Chat footer composer — consolidated from Composer + HmatComposer. Always
 * visible once a session is active; no separate "Start Chat" gate.
 */
export function ChatActionBar({
  onSend,
  onEndChat,
  disabled,
  onSent,
}: {
  onSend: (text: string) => void;
  onEndChat: () => void;
  disabled?: boolean;
  /** Fired after a successful send (haptics + orb pop handled by parent). */
  onSent?: () => void;
}) {
  const { t } = useLocale();
  const isHmat = DESIGNS[useDesignStore((s) => s.design)].family === "hmat";
  const [value, setValue] = useState("");
  const empty = value.trim().length === 0;

  const submit = useCallback(() => {
    const text = value.trim();
    if (!text || disabled) return;
    setValue("");
    tapMedium();
    onSend(text);
    onSent?.();
  }, [disabled, onSend, onSent, value]);

  return (
    <div className="mt-3 flex shrink-0 flex-col gap-2.5 transition-all duration-300 motion-reduce:transition-none">
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "relative flex-1",
            isHmat ? "mat-field" : "rounded-full border-2 border-accent bg-card px-4 py-2",
          )}
        >
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
              isHmat ? "rounded-full px-[18px] py-3.5" : "h-11 text-sm tracking-[0.06em]",
            )}
          />
          {empty ? (
            <span
              className={cn(
                "pointer-events-none absolute inset-y-0 flex items-center font-sans text-muted-foreground",
                isHmat
                  ? "left-[18px] text-[15px]"
                  : "left-4 text-xs uppercase tracking-[0.15em]",
              )}
              aria-hidden
            >
              {isHmat ? (
                <>
                  Odpověz česky
                  <span className="animate-blink text-accent motion-reduce:animate-none">_</span>
                </>
              ) : (
                <>
                  Reply in Czech
                  <span className="ml-0.5 animate-blink motion-reduce:animate-none">_</span>
                </>
              )}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={submit}
          onPointerDown={() => {
            if (!disabled && !empty) tapLight();
          }}
          disabled={disabled || empty}
          aria-label={t.chat.send}
          className={cn(
            "flex shrink-0 items-center justify-center transition-all duration-300 motion-reduce:transition-none",
            isHmat
              ? "mat-key press h-[52px] w-[52px] rounded-full text-accent disabled:opacity-40"
              : "h-11 w-11 rounded-full bg-accent text-accent-foreground shadow-sm shadow-black/10 active:scale-[0.95] disabled:opacity-40",
          )}
        >
          {isHmat ? (
            <HardwareIcon name="send" size={22} />
          ) : (
            <SendArrowIcon />
          )}
        </button>
      </div>
      <button
        type="button"
        onClick={() => {
          tapLight();
          onEndChat();
        }}
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
