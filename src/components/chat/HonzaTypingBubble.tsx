"use client";

import { Dotm3x3_11 } from "@/components/ui/dotm-3x3-11";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";

type HonzaTypingBubbleProps = {
  variant: "classic" | "hmat";
  className?: string;
};

const GLYPH = { size: 12, dotSize: 3 } as const;

/** Three small Glyph Pulses — staggered, middle reversed — like three typing dots. */
function TypingGlyphs() {
  return (
    <span className="inline-flex items-center gap-1.5" role="status" aria-label="Honza is typing">
      <Dotm3x3_11
        size={GLYPH.size}
        dotSize={GLYPH.dotSize}
        color="var(--accent)"
        dotShape="square"
        cycleOffset={0}
        ariaLabel=""
      />
      <Dotm3x3_11
        size={GLYPH.size}
        dotSize={GLYPH.dotSize}
        color="var(--accent)"
        dotShape="square"
        cycleOffset={1 / 3}
        reverse
        ariaLabel=""
      />
      <Dotm3x3_11
        size={GLYPH.size}
        dotSize={GLYPH.dotSize}
        color="var(--accent)"
        dotShape="square"
        cycleOffset={2 / 3}
        ariaLabel=""
      />
    </span>
  );
}

export function HonzaTypingBubble({ variant, className }: HonzaTypingBubbleProps) {
  if (variant === "hmat") {
    return (
      <div className={cn("hmat-typing-enter flex w-full justify-start", className)}>
        <div className="max-w-[88%] self-start">
          <div className="hmat-bubble-honza flex items-center px-4 py-3.5">
            <TypingGlyphs />
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
    >
      <div
        className={cn(
          "flex max-w-[85%] items-center rounded-card border border-border bg-card px-3 py-2",
          TYPE.bodySm,
        )}
      >
        <TypingGlyphs />
      </div>
    </div>
  );
}
