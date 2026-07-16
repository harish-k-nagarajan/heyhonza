"use client";

import { useCallback, useState } from "react";

import { HardwareIcon } from "@/components/icons/HardwareIcons";

/**
 * Hmat reply composer — a recessed material pill field and a deep send key.
 * Full voice (STT + Honza speaking back) lives on the Call surface / dock; this
 * is the typed path, matching the round-4 reference.
 */
export function HmatComposer({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const empty = value.trim().length === 0;

  const submit = useCallback(() => {
    const t = value.trim();
    if (!t || disabled) return;
    setValue("");
    onSend(t);
  }, [disabled, onSend, value]);

  return (
    <div className="mt-3 flex shrink-0 items-center gap-2.5">
      <div className="mat-field relative flex-1">
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
          aria-label="Odpověz česky"
          className="w-full rounded-full bg-transparent px-[18px] py-3.5 font-sans text-[15px] text-foreground outline-none disabled:opacity-50"
        />
        {empty ? (
          <span
            className="pointer-events-none absolute inset-y-0 left-[18px] flex items-center font-sans text-[15px] text-muted-foreground"
            aria-hidden
          >
            Odpověz česky<span className="text-accent">_</span>
          </span>
        ) : null}
      </div>
      <button
        type="button"
        onClick={submit}
        disabled={disabled || empty}
        aria-label="Odeslat"
        className="mat-key press flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full text-accent disabled:opacity-40"
      >
        <HardwareIcon name="send" size={22} />
      </button>
    </div>
  );
}
