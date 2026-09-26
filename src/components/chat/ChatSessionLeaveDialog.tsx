"use client";

import { TYPE } from "@/lib/design/typography";
import { cn } from "@/lib/cn";

export function ChatSessionLeaveDialog({
  title,
  body,
  continueLabel,
  endLabel,
  onContinue,
  onEnd,
}: {
  title: string;
  body: string;
  continueLabel: string;
  endLabel: string;
  onContinue: () => void;
  onEnd: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2A2420]/16 p-5 backdrop-blur-[2px]"
      onClick={onContinue}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-leave-title"
        className="hmat-chat-leave-dialog hmat-confirm-sheet space-y-3 px-4 py-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1 text-center">
          <p
            id="chat-leave-title"
            className="font-display text-[15px] font-semibold tracking-[0.02em] text-[#243D2C]"
          >
            {title}
          </p>
          <p className={cn(TYPE.bodySm, "text-[#6E8A74]")}>{body}</p>
        </div>
        <div className="flex flex-col gap-2 pt-0.5">
          <button
            type="button"
            onClick={onContinue}
            className="hmat-ink-action flex h-10 w-full items-center justify-center rounded-2xl text-white"
          >
            <span className={cn(TYPE.bodySm, "font-display font-semibold")}>{continueLabel}</span>
          </button>
          <button
            type="button"
            onClick={onEnd}
            className="flex h-10 w-full items-center justify-center rounded-2xl border border-white/70 bg-white/55 font-display text-[13px] text-[#243D2C] backdrop-blur-md"
          >
            {endLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
