"use client";

import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";

type HonzaTypingBubbleProps = {
  variant: "classic" | "hmat";
  className?: string;
};

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            "size-2 rounded-full bg-accent opacity-40",
            "motion-safe:animate-typing-dot motion-reduce:animate-none motion-reduce:opacity-60",
          )}
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  );
}

export function HonzaTypingBubble({ variant, className }: HonzaTypingBubbleProps) {
  if (variant === "hmat") {
    return (
      <div
        className={cn(
          "flex w-full justify-start motion-safe:animate-typing-bubble-in motion-reduce:animate-none motion-reduce:opacity-100",
          className,
        )}
        role="status"
        aria-label="Honza is typing"
      >
        <div className="max-w-[88%] self-start">
          <div className="hmat-bubble-honza px-4 py-3.5">
            <TypingDots />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full justify-start motion-safe:animate-typing-bubble-in motion-reduce:animate-none motion-reduce:opacity-100",
        className,
      )}
      role="status"
      aria-label="Honza is typing"
    >
      <div
        className={cn(
          "max-w-[85%] rounded-card border border-border bg-card px-3 py-2",
          TYPE.bodySm,
        )}
      >
        <TypingDots />
      </div>
    </div>
  );
}
