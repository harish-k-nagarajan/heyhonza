"use client";

import { useMemo } from "react";

import { cn } from "@/lib/cn";
import { moodExpression } from "@/lib/mood/expression";
import { ORB_FRAME_SCALE } from "./orbFrame";
import type { HonzaOrbState } from "./theme";

/**
 * Live dot ring around the orb face — inside the recess frame, never over the
 * 15×15 matrix. A ripple travels the perimeter during thinking / speaking /
 * excited; amplitude scales from `--energy` (hue stays `--accent`).
 */

const VIEW = 100;
const DOT = 2.2;

/** Moods that drive the border ripple; idle / oops stay calm. */
function isLiveState(state: HonzaOrbState): boolean {
  return state === "thinking" || state === "speaking" || state === "excited";
}

type RingDot = { x: number; y: number; i: number };

/** Two rings in the frame margin only (outside the centered face). */
function buildRingDots(): RingDot[] {
  const margin = (VIEW - VIEW / ORB_FRAME_SCALE) / 2;
  const rings = [
    { inset: Math.max(2, margin * 0.35), step: 4.8 },
    { inset: Math.max(3.5, margin * 0.78), step: 5.2 },
  ];
  const dots: RingDot[] = [];
  let idx = 0;

  for (const { inset, step } of rings) {
    const min = inset;
    const max = VIEW - inset;

    for (let x = min; x <= max; x += step) {
      dots.push({ x: x - DOT / 2, y: min - DOT / 2, i: idx++ });
    }
    for (let y = min + step; y <= max; y += step) {
      dots.push({ x: max - DOT / 2, y: y - DOT / 2, i: idx++ });
    }
    for (let x = max - step; x >= min; x -= step) {
      dots.push({ x: x - DOT / 2, y: max - DOT / 2, i: idx++ });
    }
    for (let y = max - step; y >= min + step; y -= step) {
      dots.push({ x: min - DOT / 2, y: y - DOT / 2, i: idx++ });
    }
  }

  return dots;
}

const RING_DOTS = buildRingDots();
const RING_COUNT = RING_DOTS.length;

export type HonzaOrbBackdropProps = {
  state?: HonzaOrbState;
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

  const dots = useMemo(() => RING_DOTS, []);

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
        ["--ring-count" as string]: RING_COUNT,
      }}
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${VIEW} ${VIEW}`} className="block">
        {dots.map(({ x, y, i }) => (
          <rect
            key={i}
            x={x}
            y={y}
            width={DOT}
            height={DOT}
            rx={DOT * 0.35}
            fill="var(--accent)"
            className={cn("orb-border-dot", live && "orb-border-dot--live")}
            style={{ ["--dot-i" as string]: i }}
          />
        ))}
      </svg>
    </div>
  );
}
