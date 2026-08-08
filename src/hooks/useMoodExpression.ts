"use client";

import { moodExpression } from "@/lib/mood/expression";
import type { MoodExpression } from "@/lib/mood/expression";
import { useLocale } from "@/lib/i18n/useLocale";
import { useDesignStore } from "@/stores/useDesignStore";
import { useMoodStore } from "@/stores/useMoodStore";

/**
 * The one hook every surface uses to read the current mood expression (accent,
 * background, energy, Czech label + caption) for the active design. Reads the
 * shared mood store and the design store and routes both through the expression
 * engine — so no screen recomputes mood styling on its own.
 */
export function useMoodExpression(): MoodExpression {
  const mood = useMoodStore((s) => s.mood);
  const design = useDesignStore((s) => s.design);
  const { locale } = useLocale();
  return moodExpression(mood, design, locale);
}
