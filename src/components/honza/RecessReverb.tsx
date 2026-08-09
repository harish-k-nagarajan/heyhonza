"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

import type { HonzaOrbState } from "./theme";

export type RecessMotion = "idle" | "thinking" | "speak" | "burst" | "oops";

export function recessMotion(
  orbState: HonzaOrbState,
  loading: boolean | undefined,
  speakFlash: boolean,
  reactPop: boolean,
): RecessMotion {
  if (speakFlash) return "speak";
  if (reactPop) return "burst";
  if (loading || orbState === "thinking") return "thinking";
  if (orbState === "oops") return "oops";
  return "idle";
}

/** Square-pixel dust along a rounded-square perimeter (orb DNA). */
const DUST: readonly { x: number; y: number; s: number }[] = [
  { x: 12, y: 2, s: 2 },
  { x: 28, y: 1, s: 2.5 },
  { x: 44, y: 2, s: 2 },
  { x: 56, y: 1, s: 2 },
  { x: 72, y: 2, s: 2.5 },
  { x: 88, y: 2, s: 2 },
  { x: 98, y: 14, s: 2 },
  { x: 99, y: 30, s: 2.5 },
  { x: 98, y: 46, s: 2 },
  { x: 99, y: 62, s: 2 },
  { x: 98, y: 78, s: 2.5 },
  { x: 97, y: 92, s: 2 },
  { x: 84, y: 98, s: 2 },
  { x: 68, y: 99, s: 2.5 },
  { x: 52, y: 98, s: 2 },
  { x: 36, y: 99, s: 2 },
  { x: 20, y: 98, s: 2.5 },
  { x: 6, y: 92, s: 2 },
  { x: 1, y: 78, s: 2 },
  { x: 2, y: 62, s: 2.5 },
  { x: 1, y: 46, s: 2 },
  { x: 2, y: 30, s: 2 },
  { x: 1, y: 14, s: 2.5 },
];

/**
 * Square-aligned reverb: a rounded-square line expands from the bezel, then
 * dissolves into square particles — clipped inside the display module.
 * Speak/burst remount so one-shots always start clean (no mid-loop jump).
 */
export function RecessReverb({ motion }: { motion: RecessMotion }) {
  const [pulseKey, setPulseKey] = useState(0);
  const prevMotion = useRef(motion);

  useEffect(() => {
    const wasPulse = prevMotion.current === "speak" || prevMotion.current === "burst";
    const isPulse = motion === "speak" || motion === "burst";
    if (isPulse && (!wasPulse || prevMotion.current !== motion)) {
      setPulseKey((n) => n + 1);
    }
    prevMotion.current = motion;
  }, [motion]);

  const waveCount = motion === "idle" || motion === "oops" ? 1 : 2;
  const remountKey =
    motion === "speak" || motion === "burst" ? `${motion}-${pulseKey}` : motion;

  return (
    <div
      key={remountKey}
      className={cn("hmat-recess-reverb pointer-events-none absolute inset-0", `hmat-recess-reverb--${motion}`)}
      aria-hidden
    >
      {Array.from({ length: waveCount }, (_, wave) => (
        <div key={wave} className="hmat-reverb-wave" data-wave={wave}>
          <svg className="hmat-reverb-line" viewBox="0 0 100 100" aria-hidden>
            <rect
              className="hmat-reverb-stroke"
              x="3"
              y="3"
              width="94"
              height="94"
              rx="14"
              pathLength={100}
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {(motion === "speak" || motion === "burst") && (
            <div className="hmat-reverb-dust">
              {DUST.map((p, i) => (
                <span
                  key={i}
                  className="hmat-reverb-dot"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: p.s,
                    height: p.s,
                    ["--dx" as string]: `${((p.x - 50) / 50) * 8}px`,
                    ["--dy" as string]: `${((p.y - 50) / 50) * 8}px`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
