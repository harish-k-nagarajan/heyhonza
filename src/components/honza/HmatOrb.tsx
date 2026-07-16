"use client";

import { useMemo } from "react";

import { cn } from "@/lib/cn";
import { moodExpression } from "@/lib/mood/expression";
import type { HonzaOrbState } from "./theme";

/**
 * The Hmat orb — the same 15×15 dot-matrix DNA as Classic's `HonzaOrb`, evolved
 * for the tactile world: a backlight glow, an emissive drop-shadow, and a
 * specular dome, all scaled by the mood's `--energy` (dim/calm at idle,
 * bright/lively at excited — the idle-vs-excited fix, never a re-hue). A blink
 * loop collapses the eyes ~every 5s (faster with energy), and a press/answer
 * `react-pop` can be triggered on real events.
 *
 * The pixel maps are the RE-AUTHORED round-4 set (MLUVÍ = open-mouth "O", MYSLÍ =
 * eyes-up + thought bubble, every state a readable 2×2 eye pair + distinct
 * mouth). Classic keeps its original maps in `HonzaOrb`; these are Hmat-only.
 */

const GRID = 15;
const VIEW = 90;
const CELL = VIEW / GRID;
const DOT = CELL * 0.82;
const PAD = (CELL - DOT) / 2;
const BG_A = 0.1;
const FAINT = 0.42;

const k = (x: number, y: number) => `${x},${y}`;
const EL = [k(4, 5), k(5, 5), k(4, 6), k(5, 6)];
const ER = [k(9, 5), k(10, 5), k(9, 6), k(10, 6)];
const EL_LINE = [k(4, 6), k(5, 6)];
const ER_LINE = [k(9, 6), k(10, 6)];

type FaceMap = { a: string[]; f: string[]; blink: string[] };

const MAPS: Record<HonzaOrbState, FaceMap> = {
  // calm, content — 2×2 eyes, gentle U smile, faint cheeks
  idle: {
    a: [...EL, ...ER, k(4, 9), k(10, 9), k(5, 10), k(6, 10), k(7, 10), k(8, 10), k(9, 10)],
    f: [k(2, 8), k(12, 8)],
    blink: [...EL_LINE, ...ER_LINE, k(4, 9), k(10, 9), k(5, 10), k(6, 10), k(7, 10), k(8, 10), k(9, 10)],
  },
  // pondering — eyes up + neutral mouth + thought bubble top-right
  thinking: {
    a: [k(4, 4), k(5, 4), k(4, 5), k(5, 5), k(9, 4), k(10, 4), k(9, 5), k(10, 5), k(6, 10), k(7, 10), k(8, 10), k(12, 1), k(13, 1), k(12, 2), k(13, 2)],
    f: [k(11, 3)],
    blink: [k(4, 5), k(5, 5), k(9, 5), k(10, 5), k(6, 10), k(7, 10), k(8, 10), k(12, 1), k(13, 1), k(12, 2), k(13, 2)],
  },
  // talking — eyes + hollow open mouth "O"
  speaking: {
    a: [...EL, ...ER, k(6, 9), k(7, 9), k(8, 9), k(5, 10), k(9, 10), k(6, 11), k(7, 11), k(8, 11)],
    f: [k(12, 6), k(13, 7)],
    blink: [...EL_LINE, ...ER_LINE, k(6, 9), k(7, 9), k(8, 9), k(5, 10), k(9, 10), k(6, 11), k(7, 11), k(8, 11)],
  },
  // gentle correction — worried raised-inner brows + small eyes + shallow frown
  oops: {
    a: [k(3, 3), k(4, 4), k(11, 3), k(10, 4), k(4, 5), k(5, 5), k(9, 5), k(10, 5), k(5, 11), k(6, 10), k(7, 10), k(8, 10), k(9, 11)],
    f: [],
    blink: [k(3, 3), k(4, 4), k(11, 3), k(10, 4), k(4, 6), k(5, 6), k(9, 6), k(10, 6), k(5, 11), k(6, 10), k(7, 10), k(8, 10), k(9, 11)],
  },
  // delighted — wide eyes + big grin + cheeks
  excited: {
    a: [k(3, 4), k(4, 4), k(5, 4), k(3, 5), k(4, 5), k(5, 5), k(9, 4), k(10, 4), k(11, 4), k(9, 5), k(10, 5), k(11, 5), k(3, 9), k(11, 9), k(4, 10), k(10, 10), k(5, 11), k(6, 11), k(7, 11), k(8, 11), k(9, 11)],
    f: [k(2, 7), k(12, 7)],
    blink: [k(3, 5), k(4, 5), k(5, 5), k(9, 5), k(10, 5), k(11, 5), k(3, 9), k(11, 9), k(4, 10), k(10, 10), k(5, 11), k(6, 11), k(7, 11), k(8, 11), k(9, 11)],
  },
};

type Cell = { x: number; y: number; mode: "accent" | "faint" | "bg" };

function cellsFor(accent: string[], faint: string[]): Cell[] {
  const A = new Set(accent);
  const F = new Set(faint);
  const out: Cell[] = [];
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const id = k(x, y);
      out.push({ x, y, mode: A.has(id) ? "accent" : F.has(id) ? "faint" : "bg" });
    }
  }
  return out;
}

function Face({ cells }: { cells: Cell[] }) {
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${VIEW} ${VIEW}`} aria-hidden>
      {cells.map(({ x, y, mode }) => {
        if (mode === "bg") {
          const d = DOT * 0.28;
          const cx = x * CELL + CELL / 2 - d / 2;
          const cy = y * CELL + CELL / 2 - d / 2;
          return (
            <rect key={`${x}-${y}`} x={cx} y={cy} width={d} height={d} rx={d * 0.35} fill={`rgba(0,0,0,${BG_A})`} />
          );
        }
        const xi = x * CELL + PAD;
        const yi = y * CELL + PAD;
        const rx = Math.min(DOT * 0.22, CELL * 0.28);
        return (
          <rect
            key={`${x}-${y}`}
            x={xi}
            y={yi}
            width={DOT}
            height={DOT}
            rx={rx}
            fill="var(--accent)"
            opacity={mode === "faint" ? FAINT : 1}
          />
        );
      })}
    </svg>
  );
}

export type HmatOrbProps = {
  state?: HonzaOrbState;
  /** Pixel size of the square orb. */
  size?: number;
  /** Slow breathing scale. On by default; off for small inline avatars. */
  breathe?: boolean;
  className?: string;
  /** Extra class on the .stack — used to trigger the react-pop keyframe. */
  stackClassName?: string;
};

export function HmatOrb({
  state = "idle",
  size = 150,
  breathe = true,
  className,
  stackClassName,
}: HmatOrbProps) {
  const map = MAPS[state] ?? MAPS.idle;
  const openCells = useMemo(() => cellsFor(map.a, map.f), [map]);
  const blinkCells = useMemo(() => cellsFor(map.blink, map.f), [map]);
  // Self-tinting: each orb carries its own state's accent + energy, so a face
  // shown out of the app flow (a specimen, an inline avatar) reads correctly.
  const expr = moodExpression(state);

  return (
    <div
      className={cn("hmat-orb", className)}
      data-orb={state}
      style={{
        width: size,
        height: size,
        ["--accent" as string]: expr.accent,
        ["--energy" as string]: expr.energy,
      }}
    >
      <div className={cn("stack", breathe && "breathe", stackClassName)}>
        <div className="open-layer" style={{ position: "absolute", inset: 0, opacity: 1 }}>
          <Face cells={openCells} />
        </div>
        <div className="blink-layer" style={{ position: "absolute", inset: 0, opacity: 0 }}>
          <Face cells={blinkCells} />
        </div>
      </div>
    </div>
  );
}
