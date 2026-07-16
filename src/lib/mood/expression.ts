/**
 * The mood expression engine — the single `mood + design → expression` mapping.
 *
 * Every surface reads its output; no screen computes its own mood styling. This
 * is what makes idle and excited *perceptibly* different without re-hueing them:
 * they share the accent (`#E8432D`) on purpose (DESIGN.md), so the difference is
 * carried by an **energy** channel (0..1) that drives glow, motion amplitude,
 * the lit accent channel, and press feel — dim/calm at idle, bright/lively at
 * excited. Accent + background hues stay locked to `HONZA_STATE_COLORS`.
 *
 * `design` is part of the signature because the *expression of* energy is
 * design-dependent (Hmat lights a recessed channel and scales the orb backlight;
 * Classic keeps its shipped, byte-for-byte look and simply doesn't read it). The
 * energy *values* are shared, so idle≠excited is true everywhere the design
 * chooses to show it.
 */

import { HONZA_STATE_COLORS } from "@/components/honza/theme";
import type { HonzaOrbState } from "@/components/honza/theme";
import { DEFAULT_DESIGN } from "@/lib/design/registry";
import type { DesignId } from "@/lib/design/registry";

export type Mood = HonzaOrbState;

/** The order the moods cycle in (home badge, dev cycler, Lab specimen). */
export const MOOD_ORDER: Mood[] = ["idle", "thinking", "speaking", "oops", "excited"];

export type MoodExpression = {
  mood: Mood;
  design: DesignId;
  /** Screen tint for this mood (locked hue). */
  background: string;
  /** Accent hue for this mood (locked). idle and excited deliberately match. */
  accent: string;
  /** 0..1 energy — idle low, excited high. Drives glow / motion / channel / press. */
  energy: number;
  /** Short Czech state word: KLID · MYSLÍ · MLUVÍ · CHYBA · SKVĚLE. */
  czLabel: string;
  /** Czech caption shown under the character. */
  caption: string;
};

/** Energy + Czech copy per mood (design-independent values). Lifted from round4-hmat.html. */
const MOOD_BASE: Record<Mood, { energy: number; czLabel: string; caption: string }> = {
  idle: { energy: 0.35, czLabel: "KLID", caption: "Čeká na tebe" },
  thinking: { energy: 0.62, czLabel: "MYSLÍ", caption: "Přemýšlí" },
  speaking: { energy: 0.72, czLabel: "MLUVÍ", caption: "Odpovídá" },
  oops: { energy: 0.5, czLabel: "CHYBA", caption: "Jemně opravuje" },
  excited: { energy: 1.0, czLabel: "SKVĚLE", caption: "Skvěle!" },
};

export function moodExpression(
  mood: Mood,
  design: DesignId = DEFAULT_DESIGN,
): MoodExpression {
  const color = HONZA_STATE_COLORS[mood];
  const base = MOOD_BASE[mood];
  return {
    mood,
    design,
    background: color.background,
    accent: color.accent,
    energy: base.energy,
    czLabel: base.czLabel,
    caption: base.caption,
  };
}
