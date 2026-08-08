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
import { DEFAULT_LOCALE, getStrings, type UiLocale } from "@/lib/i18n/locales";

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
  /** Short state word shown under the character. */
  czLabel: string;
  /** Caption shown under the character. */
  caption: string;
};

/** Energy per mood (design-independent values). */
const MOOD_ENERGY: Record<Mood, number> = {
  idle: 0.35,
  thinking: 0.62,
  speaking: 0.72,
  oops: 0.5,
  excited: 1.0,
};

export function moodExpression(
  mood: Mood,
  design: DesignId = DEFAULT_DESIGN,
  locale: UiLocale = DEFAULT_LOCALE,
): MoodExpression {
  const color = HONZA_STATE_COLORS[mood];
  const copy = getStrings(locale).mood.expression[mood];
  return {
    mood,
    design,
    background: color.background,
    accent: color.accent,
    energy: MOOD_ENERGY[mood],
    czLabel: copy.label,
    caption: copy.caption,
  };
}
