"use client";

import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
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
          TYPE.kicker,
          "text-accent",
          compact && "text-[8px]",
        )}
      >
        {loading ? thinkingLabel : expression.czLabel}
      </p>
      {!compact ? (
        <p className={TYPE.helper}>{expression.caption}</p>
      ) : null}
    </div>
  );
}
