"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

import type { HonzaOrbState } from "./theme";

const RIPPLE_COUNT = 3;

export type OrbRipplesProps = {
  state: HonzaOrbState;
  /** Orb size in pixels — ripples expand from this diameter. */
  size: number;
  className?: string;
};

function rippleMotionClass(state: HonzaOrbState): string {
  switch (state) {
    case "oops":
      return "";
    case "thinking":
      return "motion-safe:animate-orb-ripple-thinking motion-reduce:animate-none motion-reduce:opacity-[0.08]";
    case "speaking":
      return "motion-safe:animate-orb-ripple-speak motion-reduce:animate-none";
    case "idle":
    case "excited":
      return "motion-safe:animate-orb-ripple-idle motion-reduce:animate-none motion-reduce:opacity-[0.06]";
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

/**
 * Concentric rings that expand outward from the orb edge — not a perimeter dot
 * ring on top of the square matrix. The face itself is clipped to a circle
 * (see HmatOrb / HonzaOrb); these ripples carry the "alive" motion outward.
 */
export function OrbRipples({ state, size, className }: OrbRipplesProps) {
  const prevState = useRef(state);
  const [speakKey, setSpeakKey] = useState(0);

  useLayoutEffect(() => {
    if (state === "speaking" && prevState.current !== "speaking") {
      setSpeakKey((n) => n + 1);
    }
    prevState.current = state;
  }, [state]);

  const motionClass = rippleMotionClass(state);

  return (
    <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden>
      {Array.from({ length: RIPPLE_COUNT }, (_, i) => {
        let animationDelay: string | undefined;
        if (state === "thinking") {
          animationDelay = `${i * 600}ms`;
        } else if (state === "idle" || state === "excited") {
          animationDelay = `${i * 1.6}s`;
        }

        return (
          <div
            key={state === "speaking" ? `speak-${speakKey}-${i}` : i}
            className={cn(
              "absolute left-1/2 top-1/2 rounded-full border border-accent",
              motionClass,
              state === "oops" && "opacity-0",
            )}
            style={{
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
              animationDelay,
            }}
          />
        );
      })}
    </div>
  );
}
