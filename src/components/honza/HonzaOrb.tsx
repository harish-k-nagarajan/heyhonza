"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { HONZA_STATE_COLORS } from "./theme";
import type { HonzaOrbState } from "./theme";

// Re-exported for back-compat; canonical home is `honza/theme`.
export { HONZA_STATE_COLORS };
export type { HonzaOrbState };

export type HonzaOrbSize = "hero" | "avatar";

const GRID = 15;
const VIEW = 90;
const CELL = VIEW / GRID;
/** Rounded “pixel” inside each cell (Share Tech / Nothing-style matrix). */
const DOT = CELL * 0.82;
const PAD = (CELL - DOT) / 2;
const BG_DOT_ALPHA = 0.1;
const FAINT_OPACITY = 0.42;

function key(x: number, y: number) {
  return `${x},${y}`;
}

function parseSet(entries: readonly string[]) {
  return new Set(entries);
}

/** Idle / happy — 2×2 eyes, U smile, faint cheeks. */
const IDLE_ACCENT = parseSet([
  // eyes L
  key(3, 4),
  key(4, 4),
  key(3, 5),
  key(4, 5),
  // eyes R
  key(10, 4),
  key(11, 4),
  key(10, 5),
  key(11, 5),
  // smile
  key(4, 10),
  key(5, 11),
  key(6, 11),
  key(7, 11),
  key(8, 11),
  key(9, 11),
  key(10, 10),
]);

const IDLE_FAINT = parseSet([key(1, 7), key(13, 7)]);

/** Excited — wider 3×2 eyes, wider smile, stronger cheeks. */
const EXCITED_ACCENT = parseSet([
  key(2, 3),
  key(3, 3),
  key(4, 3),
  key(2, 4),
  key(3, 4),
  key(4, 4),
  key(10, 3),
  key(11, 3),
  key(12, 3),
  key(10, 4),
  key(11, 4),
  key(12, 4),
  key(3, 10),
  key(4, 11),
  key(5, 12),
  key(6, 12),
  key(7, 12),
  key(8, 12),
  key(9, 12),
  key(10, 11),
  key(11, 10),
]);

const EXCITED_FAINT = parseSet([key(1, 6), key(1, 7), key(13, 6), key(13, 7)]);

/** Thinking — asymmetric eyes, flat mouth, thought pixels. */
const THINKING_ACCENT = parseSet([
  key(3, 5),
  key(4, 5),
  key(11, 5),
  key(6, 10),
  key(7, 10),
  key(8, 10),
  key(12, 1),
  key(13, 2),
  key(14, 3),
]);

const THINKING_FAINT = parseSet([] as string[]);

/** Speaking — open mouth block, sound to the right. */
const SPEAKING_ACCENT = parseSet([
  key(3, 4),
  key(4, 4),
  key(10, 4),
  key(11, 4),
  key(5, 9),
  key(6, 9),
  key(7, 9),
  key(5, 10),
  key(6, 10),
  key(7, 10),
  key(12, 5),
  key(13, 6),
  key(12, 7),
  key(14, 6),
  key(13, 8),
]);

const SPEAKING_FAINT = parseSet([] as string[]);

/** Oops — brows + eyes, frown, tear column. */
const OOPS_ACCENT = parseSet([
  key(4, 2),
  key(4, 3),
  key(10, 2),
  key(10, 3),
  key(4, 6),
  key(10, 6),
  key(4, 10),
  key(5, 11),
  key(6, 11),
  key(7, 11),
  key(8, 11),
  key(9, 11),
  key(10, 10),
  key(2, 8),
  key(2, 9),
  key(2, 10),
]);

const OOPS_FAINT = parseSet([] as string[]);

function pixelsForState(state: HonzaOrbState): { accent: Set<string>; faint: Set<string> } {
  switch (state) {
    case "idle":
      return { accent: IDLE_ACCENT, faint: IDLE_FAINT };
    case "excited":
      return { accent: EXCITED_ACCENT, faint: EXCITED_FAINT };
    case "thinking":
      return { accent: THINKING_ACCENT, faint: THINKING_FAINT };
    case "speaking":
      return { accent: SPEAKING_ACCENT, faint: SPEAKING_FAINT };
    case "oops":
      return { accent: OOPS_ACCENT, faint: OOPS_FAINT };
    default:
      return { accent: IDLE_ACCENT, faint: IDLE_FAINT };
  }
}

const SIZE_PX: Record<HonzaOrbSize, number> = {
  hero: 200,
  avatar: 64,
};

export type HonzaOrbProps = {
  state?: HonzaOrbState;
  size?: HonzaOrbSize;
  className?: string;
};

export function HonzaOrb({ state = "idle", size = "hero", className }: HonzaOrbProps) {
  const uid = useId();
  const clipId = `${uid}-clip`;
  const px = SIZE_PX[size];
  const [renderState, setRenderState] = useState(state);
  const [crossOpacity, setCrossOpacity] = useState(1);
  const isFirstMount = useRef(true);
  const [speakingTick, setSpeakingTick] = useState(0);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setCrossOpacity(0);
    const t = window.setTimeout(() => {
      setRenderState(state);
      window.requestAnimationFrame(() => {
        setCrossOpacity(1);
      });
    }, 200);
    return () => window.clearTimeout(t);
  }, [state]);

  const prevForSpeaking = useRef(state);
  useLayoutEffect(() => {
    if (state === "speaking" && prevForSpeaking.current !== "speaking") {
      setSpeakingTick((n) => n + 1);
    }
    prevForSpeaking.current = state;
  }, [state]);

  const { accent, faint } = useMemo(() => pixelsForState(renderState), [renderState]);

  const cells = useMemo(() => {
    const out: { x: number; y: number; mode: "accent" | "faint" | "bg" }[] = [];
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        const k = key(x, y);
        if (accent.has(k)) out.push({ x, y, mode: "accent" });
        else if (faint.has(k)) out.push({ x, y, mode: "faint" });
        else out.push({ x, y, mode: "bg" });
      }
    }
    return out;
  }, [accent, faint]);

  const motionClass = useMemo(() => {
    switch (state) {
      case "idle":
        return "motion-safe:animate-honza-idle motion-reduce:animate-none";
      case "thinking":
        return "motion-safe:animate-honza-thinking motion-reduce:animate-none";
      case "speaking":
        return "motion-safe:animate-honza-speak motion-reduce:animate-none";
      case "oops":
        return "motion-safe:animate-honza-oops motion-reduce:animate-none";
      case "excited":
        return "motion-safe:animate-honza-excited motion-reduce:animate-none";
      default:
        return "";
    }
  }, [state]);

  const facePalette = HONZA_STATE_COLORS[renderState];

  return (
    <div
      className={cn(
        "inline-flex origin-center transition-opacity duration-200 ease-out",
        className,
      )}
      style={{
        width: px,
        height: px,
        opacity: crossOpacity,
        ["--honza-accent" as string]: facePalette.accent,
      }}
      data-honza-state={state}
      data-honza-size={size}
    >
      <div
        key={state === "speaking" ? `speak-${speakingTick}` : state}
        className={cn(
          "flex h-full w-full origin-center will-change-transform motion-reduce:animate-none",
          motionClass,
        )}
        style={{ ["--honza-accent" as string]: facePalette.accent }}
      >
        <svg
          width={px}
          height={px}
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          className="block overflow-visible"
          aria-hidden
        >
          <defs>
            <clipPath id={clipId}>
              <rect x={0} y={0} width={VIEW} height={VIEW} rx={CELL * 0.2} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            <rect x={0} y={0} width={VIEW} height={VIEW} fill={facePalette.background} />
            {cells.map(({ x, y, mode }) => {
              const xi = x * CELL + PAD;
              const yi = y * CELL + PAD;
              const rx = Math.min(DOT * 0.22, CELL * 0.28);
              if (mode === "accent") {
                return (
                  <rect
                    key={`${x}-${y}-a`}
                    x={xi}
                    y={yi}
                    width={DOT}
                    height={DOT}
                    rx={rx}
                    fill="var(--honza-accent)"
                  />
                );
              }
              if (mode === "faint") {
                return (
                  <rect
                    key={`${x}-${y}-f`}
                    x={xi}
                    y={yi}
                    width={DOT}
                    height={DOT}
                    rx={rx}
                    fill="var(--honza-accent)"
                    opacity={FAINT_OPACITY}
                  />
                );
              }
              const d = DOT * 0.28;
              const cx = x * CELL + CELL / 2 - d / 2;
              const cy = y * CELL + CELL / 2 - d / 2;
              return (
                <rect
                  key={`${x}-${y}-b`}
                  x={cx}
                  y={cy}
                  width={d}
                  height={d}
                  rx={d * 0.35}
                  fill={`rgba(0,0,0,${BG_DOT_ALPHA})`}
                />
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
