"use client";

import { cn } from "@/lib/cn";
import type { MoodExpression } from "@/lib/mood/expression";

/**
 * Lit channel + Czech mood label + caption under the orb. Used on Chat and Call.
 */
export function MoodOrbStrip({
  expression,
  loading,
  thinkingLabel,
  channelPulse,
  compact = false,
  showChannel = true,
  className,
}: {
  expression: MoodExpression;
  loading?: boolean;
  thinkingLabel: string;
  channelPulse?: boolean;
  compact?: boolean;
  showChannel?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center", compact ? "flex-1 gap-1" : "gap-2", className)}>
      {showChannel ? (
        <div
          className={cn(
            "mat-channel motion-reduce:animate-none",
            channelPulse && "motion-safe:animate-channel-pulse",
            compact ? "w-full max-w-[140px]" : "w-[56%]",
          )}
          aria-hidden
        />
      ) : null}
      <p
        className={cn(
          "font-display uppercase tracking-[0.16em] text-accent",
          compact ? "text-[8px]" : "text-[9px]",
        )}
      >
        {loading ? thinkingLabel : expression.czLabel}
      </p>
      {!compact ? (
        <p className="font-sans text-xs text-muted-foreground">{expression.caption}</p>
      ) : null}
    </div>
  );
}
