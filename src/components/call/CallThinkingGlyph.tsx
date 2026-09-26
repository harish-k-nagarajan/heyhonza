"use client";

import { DotmCircular3 } from "@/components/ui/dotm-circular-3";
import { cn } from "@/lib/cn";

/** Round comet-ring from the same dot-matrix family as the chat typing glyphs. */
export function CallThinkingGlyph({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn("flex min-h-0 items-center justify-center py-1", className)}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <DotmCircular3
        size={22}
        dotSize={3}
        color="var(--accent)"
        dotShape="square"
        ariaLabel=""
      />
    </div>
  );
}
