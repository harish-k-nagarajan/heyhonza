"use client";

import type { HonzaOrbState } from "@/components/honza/theme";
import { cn } from "@/lib/cn";

function lightMoodClass(mood: HonzaOrbState): string {
  switch (mood) {
    case "idle":
      return "hmat-recess-light--idle";
    case "thinking":
      return "hmat-recess-light--thinking";
    case "speaking":
      return "hmat-recess-light--speaking";
    case "oops":
      return "hmat-recess-light--oops";
    case "excited":
      return "hmat-recess-light--excited";
    default: {
      const _exhaustive: never = mood;
      return _exhaustive;
    }
  }
}

/** Mood blots + frost-clear pane, clipped to the whole recess card, behind the orb. */
export function RecessCardLight({
  mood,
  speakFlash,
}: {
  mood: HonzaOrbState;
  speakFlash: boolean;
}) {
  return (
    <div className="hmat-recess-well" aria-hidden>
      <div
        className={cn(
          "hmat-recess-light hmat-recess-light--blots",
          lightMoodClass(mood),
          speakFlash && "hmat-recess-light--bloom",
        )}
      >
        <span className="hmat-recess-blot hmat-recess-blot--a" />
        <span className="hmat-recess-blot hmat-recess-blot--b" />
        <span className="hmat-recess-blot hmat-recess-blot--c" />
      </div>
      <div className="hmat-recess-pane hmat-recess-pane--clear" />
    </div>
  );
}
