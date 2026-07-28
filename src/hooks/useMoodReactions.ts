"use client";

import { useEffect, useRef } from "react";

import { hapticOops, hapticSuccess, tapLight } from "@/lib/interaction/haptic";
import type { Mood } from "@/lib/mood/expression";
import { useMoodStore } from "@/stores/useMoodStore";

/**
 * Wires mood transitions to haptics + optional orb react-pop. Call once per
 * screen that shows the hero orb.
 */
export function useMoodReactions(triggerPop: () => void) {
  const mood = useMoodStore((s) => s.mood);
  const prevRef = useRef<Mood>(mood);

  useEffect(() => {
    const prev = prevRef.current;
    if (prev === mood) return;

    if (mood === "excited") {
      hapticSuccess();
      triggerPop();
    } else if (mood === "oops" && prev !== "oops") {
      hapticOops();
      triggerPop();
    } else if (mood === "speaking" && prev === "thinking") {
      tapLight();
      triggerPop();
    }

    prevRef.current = mood;
  }, [mood, triggerPop]);
}
