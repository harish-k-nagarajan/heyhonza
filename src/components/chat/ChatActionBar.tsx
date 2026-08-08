"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/Button";
import { HardwareIcon } from "@/components/icons/HardwareIcons";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import { useLocale } from "@/lib/i18n/useLocale";
import { tapLight } from "@/lib/interaction/haptic";
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
              "w-full bg-transparent text-foreground outline-none disabled:opacity-50",
              isHmat
                ? cn(TYPE.body, "rounded-full px-[18px] py-3.5")
                : "h-11 font-sans text-sm tracking-[0.06em]",
            )}
          />
          {empty ? (
            <span
              className={cn(
                "pointer-events-none absolute inset-y-0 flex items-center text-muted-foreground",
                isHmat
                  ? cn("left-[18px]", TYPE.body)
                  : "left-4 font-sans text-xs uppercase tracking-[0.15em]",
              )}
              aria-hidden
            >
              {isHmat ? (
                <>
                  {t.chat.replyInCzech}
                  <span className="animate-blink text-accent motion-reduce:animate-none">_</span>
                </>
              ) : (
                <>
                  {t.chat.replyInCzech}
                  <span className="ml-0.5 animate-blink motion-reduce:animate-none">_</span>
                </>
              )}
            </span>
          ) : null}
        </div>
        {isHmat ? (
          <Button
            type="button"
            surface="mat-key"
            shape="circle"
            size="icon-md"
            haptic="medium"
            onClick={submit}
            disabled={disabled || empty}
            aria-label={t.chat.send}
            className="transition-all duration-300 motion-reduce:transition-none"
          >
            <HardwareIcon name="send" size={22} />
          </Button>
        ) : (
          <button
            type="button"
            onClick={submit}
            onPointerDown={() => {
              if (!disabled && !empty) tapLight();
            }}
            disabled={disabled || empty}
            aria-label={t.chat.send}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-sm shadow-black/10 transition-all duration-300 active:scale-[0.95] disabled:opacity-40 motion-reduce:transition-none"
          >
            <SendArrowIcon />
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          tapLight();
          onEndChat();
        }}
        disabled={disabled}
        className={cn(
          "w-full py-2 underline transition hover:text-foreground disabled:opacity-50 text-muted-foreground",
          isHmat ? TYPE.label : "font-sans text-[11px] uppercase tracking-[0.18em]",
        )}
      >
        {t.chat.endChat}
      </button>
    </div>
  );
}
