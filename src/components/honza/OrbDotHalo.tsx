"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/cn";

import type { HonzaOrbState } from "./theme";

/** Dots on the perimeter ring (spec: 28–36). */
const DOT_COUNT = 32;
/** Halo circle ~8–12% outside the orb radius. */
const HALO_RADIUS_RATIO = 1.1;
const DOT_PX = 2.5;
const SPEAK_RIPPLE_MS = 600;

export type OrbDotHaloProps = {
  state: HonzaOrbState;
  /** Orb size in pixels — ring is centered and scaled to this box. */
  size: number;
  className?: string;
};

function haloMotionClass(state: HonzaOrbState): string {
  switch (state) {
    case "oops":
      return "";
    case "thinking":
      return "motion-safe:animate-orb-halo-thinking motion-reduce:animate-none";
    case "speaking":
      return "motion-safe:animate-orb-halo-speak motion-reduce:animate-none";
    case "idle":
    case "excited":
      return "motion-safe:animate-orb-halo-idle motion-reduce:animate-none";
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

export function OrbDotHalo({ state, size, className }: OrbDotHaloProps) {
  const center = size / 2;
  const haloRadius = (size / 2) * HALO_RADIUS_RATIO;

  const dots = useMemo(
    () =>
      Array.from({ length: DOT_COUNT }, (_, i) => {
        const angle = (i / DOT_COUNT) * Math.PI * 2 - Math.PI / 2;
        return {
          i,
          cx: center + haloRadius * Math.cos(angle),
          cy: center + haloRadius * Math.sin(angle),
        };
      }),
    [center, haloRadius],
  );

  const prevState = useRef(state);
  const [speakRipple, setSpeakRipple] = useState(0);

  useLayoutEffect(() => {
    if (state === "speaking" && prevState.current !== "speaking") {
      setSpeakRipple((n) => n + 1);
    }
    prevState.current = state;
  }, [state]);

  const motionClass = haloMotionClass(state);

  return (
    <div
      className={cn("pointer-events-none absolute inset-0", className)}
      aria-hidden
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block overflow-visible"
      >
        {dots.map(({ i, cx, cy }) => {
          const half = DOT_PX / 2;
          let animationDelay: string | undefined;
          if (state === "thinking") {
            animationDelay = `${i * 50}ms`;
          } else if (state === "speaking") {
            animationDelay = `${(i / DOT_COUNT) * SPEAK_RIPPLE_MS}ms`;
          }

          return (
            <g key={state === "speaking" ? `speak-${speakRipple}-${i}` : i} transform={`translate(${cx} ${cy})`}>
              <rect
                x={-half}
                y={-half}
                width={DOT_PX}
                height={DOT_PX}
                rx={half * 0.35}
                fill="var(--accent)"
                className={cn(
                  motionClass,
                  state === "oops" && "opacity-[0.05]",
                  "motion-reduce:opacity-[0.12] motion-reduce:![animation:none]",
                )}
                style={animationDelay ? { animationDelay } : undefined}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
