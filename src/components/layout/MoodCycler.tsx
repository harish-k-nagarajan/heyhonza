"use client";

import { HONZA_STATE_COLORS } from "@/components/honza/theme";
import type { HonzaOrbState } from "@/components/honza/theme";
import { useMoodStore } from "@/stores/useMoodStore";

/**
 * Dev-only harness to manually cycle Honza through all five moods and confirm
 * both the face and the app-wide tint react (BUILD_SPEC Phase 2 verification
 * gate). Gated behind `NEXT_PUBLIC_HONZA_DEV_TOOLS=1` — the env var is inlined
 * at build time, so in a normal/production build this whole component compiles
 * down to `null` and a real user can never reach it.
 */
const STATES: HonzaOrbState[] = ["idle", "thinking", "speaking", "oops", "excited"];

export function MoodCycler() {
  const mood = useMoodStore((s) => s.mood);
  const setMood = useMoodStore((s) => s.setMood);

  if (process.env.NEXT_PUBLIC_HONZA_DEV_TOOLS !== "1") return null;

  return (
    <div
      className="fixed left-1/2 top-2 z-50 flex -translate-x-1/2 gap-1 rounded-full border border-border bg-white/85 px-2 py-1 backdrop-blur-md"
      data-testid="mood-cycler"
    >
      {STATES.map((s) => {
        const on = mood === s;
        return (
          <button
            key={s}
            type="button"
            onClick={() => setMood(s)}
            aria-pressed={on}
            title={s}
            className="flex h-6 w-6 items-center justify-center rounded-full text-[8px] uppercase transition"
            style={{
              backgroundColor: on ? HONZA_STATE_COLORS[s].accent : "transparent",
              color: on ? "#fff" : HONZA_STATE_COLORS[s].accent,
              outline: on ? "none" : `1px solid ${HONZA_STATE_COLORS[s].accent}55`,
            }}
          >
            {s[0]}
          </button>
        );
      })}
    </div>
  );
}
