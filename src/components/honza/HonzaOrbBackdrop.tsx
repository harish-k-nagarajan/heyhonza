"use client";

import { useMemo } from "react";

import { cn } from "@/lib/cn";
import { moodExpression } from "@/lib/mood/expression";
import type { HonzaOrbState } from "./theme";

/**
 * Live dot-field / waveform backdrop behind the orb face. Amplitude scales from
 * mood `--energy` (not a hue change). Sits inside the recess well, under the face
 * pixels — separate layer from `HmatOrb` / `HonzaOrb` maps.
 */

const COLS = 13;
const ROWS = 7;
const VIEW = 100;
const DOT = 2.4;
const GAP = (VIEW * 0.72) / (ROWS - 1);

/** Moods that drive live waveform motion; idle/oops stay calm. */
function isLiveState(state: HonzaOrbState): boolean {
  return state === "thinking" || state === "speaking" || state === "excited";
}

export type HonzaOrbBackdropProps = {
  state?: HonzaOrbState;
  /** Square size matching the orb it sits behind. */
  size?: number;
  className?: string;
};

export function HonzaOrbBackdrop({
  state = "idle",
  size = 150,
  className,
}: HonzaOrbBackdropProps) {
  const expr = moodExpression(state);
  const live = isLiveState(state);

  const columns = useMemo(() => {
    const colW = VIEW / COLS;
    const midY = VIEW / 2;

    return Array.from({ length: COLS }, (_, i) => {
      const originX = i * colW + colW / 2;
      const t = i / (COLS - 1);
      const wave = Math.sin(t * Math.PI * 2.4 + 0.4) * 0.5 + 0.5;
      const center = 1 - Math.abs(i - (COLS - 1) / 2) / ((COLS - 1) / 2);
      const heightNorm = 0.28 + wave * 0.32 + center * 0.18;
      const activeRows = Math.max(2, Math.round(ROWS * heightNorm));
      const startY = midY - ((activeRows - 1) * GAP) / 2;
      const dots = Array.from({ length: activeRows }, (_, r) => ({
        x: originX - DOT / 2,
        y: startY + r * GAP - DOT / 2,
      }));
      return { i, dots, delay: i * 0.07, originX };
    });
  }, []);

  return (
    <div
      className={cn("honza-orb-backdrop", className)}
      aria-hidden
      data-backdrop={state}
      data-live={live ? "true" : "false"}
      style={{
        width: size,
        height: size,
        ["--accent" as string]: expr.accent,
        ["--energy" as string]: expr.energy,
      }}
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${VIEW} ${VIEW}`} className="block">
        {columns.map(({ i, dots, delay, originX }) => (
          <g
            key={i}
            className={cn("orb-backdrop-col", live && "orb-backdrop-col--live")}
            style={{
              animationDelay: `${delay}s`,
              transformOrigin: `${originX}px ${VIEW / 2}px`,
            }}
          >
            {dots.map((d, r) => (
              <rect
                key={r}
                x={d.x}
                y={d.y}
                width={DOT}
                height={DOT}
                rx={DOT * 0.35}
                fill="var(--accent)"
              />
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}
