import { create } from "zustand";

import type { HonzaOrbState } from "@/components/honza/theme";

/**
 * Honza's mood — the single app-wide source of truth for his emotional state
 * (BUILD_SPEC §3 primitive #2, DESIGN.md's mood-reactive system).
 *
 * This is *not* a per-component prop: the character component, the app-wide
 * background/accent tint (see `AppShell`), and any screen all read from here,
 * and any AI response can drive it. Deliberately not persisted — mood is
 * ephemeral UI state that should reset to `idle` on reload.
 */
export type Mood = HonzaOrbState;

type MoodState = {
  mood: Mood;
  /** Set the durable mood (e.g. `thinking` while a request is in flight). */
  setMood: (mood: Mood) => void;
  /**
   * Show a transient mood beat, then fall back to `idle` (or a caller-chosen
   * resting mood). Used for the one-shot `speaking`/`excited` reactions when a
   * reply lands, so the orb pops and settles without the caller juggling timers.
   */
  flashMood: (mood: Mood, opts?: { ms?: number; settleTo?: Mood }) => void;
  reset: () => void;
};

let flashTimer: ReturnType<typeof setTimeout> | null = null;

export const useMoodStore = create<MoodState>((set) => ({
  mood: "idle",
  setMood: (mood) => {
    if (flashTimer) {
      clearTimeout(flashTimer);
      flashTimer = null;
    }
    set({ mood });
  },
  flashMood: (mood, opts) => {
    if (flashTimer) clearTimeout(flashTimer);
    set({ mood });
    flashTimer = setTimeout(() => {
      flashTimer = null;
      set({ mood: opts?.settleTo ?? "idle" });
    }, opts?.ms ?? 900);
  },
  reset: () => {
    if (flashTimer) {
      clearTimeout(flashTimer);
      flashTimer = null;
    }
    set({ mood: "idle" });
  },
}));
