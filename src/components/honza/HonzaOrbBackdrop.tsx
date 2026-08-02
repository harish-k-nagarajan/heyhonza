"use client";

import { useMemo } from "react";

import { cn } from "@/lib/cn";
import type { HonzaOrbState } from "./theme";

const COLS = 21;
const ROWS = 7;

type Dot = { col: number; row: number; key: string };

function buildDots(): Dot[] {
  const out: Dot[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      out.push({ col, row, key: `${col}-${row}` });
    }
  }
  return out;
}

const DOTS = buildDots();

export type HonzaOrbBackdropProps = {
  state: HonzaOrbState;
  className?: string;
};

/**
 * Dot-matrix field behind the orb inside a recess. Pulses during thinking and
 * speaking; amplitude follows the app-wide `--energy` custom property. Static
 * under `prefers-reduced-motion`.
 */
export function HonzaOrbBackdrop({ state, className }: HonzaOrbBackdropProps) {
  const live = state === "thinking" || state === "speaking";

  const dots = useMemo(() => DOTS, []);

  return (
    <div
      className={cn(
        "honza-orb-backdrop pointer-events-none absolute inset-0 z-0",
        live && "honza-orb-backdrop--live",
        className,
      )}
      data-orb-state={state}
      aria-hidden
    >
      {dots.map(({ col, row, key }) => (
        <span
          key={key}
          className="honza-orb-backdrop__dot"
          style={
            {
              ["--col" as string]: col,
              ["--row" as string]: row,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
