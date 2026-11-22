import type {HonzaOrbState} from "@/components/honza/theme";

import {BEATS} from "./timing";

const LOCKUP_CYCLE: HonzaOrbState[] = ["idle", "thinking", "speaking", "oops", "excited"];

export function moodAt(frame: number): HonzaOrbState {
  if (frame >= BEATS.lockup) {
    const step = 24;
    const index = Math.floor((frame - BEATS.lockup) / step) % LOCKUP_CYCLE.length;
    return LOCKUP_CYCLE[index];
  }
  if (frame >= BEATS.notifyIn) return "idle";
  if (frame >= BEATS.callSpeak) return "speaking";
  if (frame >= BEATS.callMove) return "idle";
  if (frame >= BEATS.fix) return "oops";
  if (frame >= BEATS.typeStart) return "thinking";
  if (frame >= BEATS.honzaOpen) return "speaking";
  if (frame >= BEATS.docIn) return "speaking";
  if (frame >= BEATS.introIn) return "excited";
  return "idle";
}