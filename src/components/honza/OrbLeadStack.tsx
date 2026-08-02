"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { HonzaOrbBackdrop } from "./HonzaOrbBackdrop";
import type { HonzaOrbState } from "./theme";
import { orbFrameSize } from "./orbFrame";

/**
 * Face + border backdrop stack. The frame is slightly larger than the orb so live
 * dots sit in the margin around the face — never over the pixel matrix.
 */
export function OrbLeadStack({
  state,
  orbSize,
  className,
  children,
}: {
  state: HonzaOrbState;
  orbSize: number;
  className?: string;
  children: ReactNode;
}) {
  const frame = orbFrameSize(orbSize);

  return (
    <span
      className={cn("orb-lead-stack", className)}
      style={{ width: frame, height: frame }}
    >
      <HonzaOrbBackdrop state={state} size={frame} />
      <span className="orb-lead-face">{children}</span>
    </span>
  );
}
