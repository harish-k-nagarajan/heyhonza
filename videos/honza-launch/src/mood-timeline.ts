import type {HonzaOrbState} from "@/components/honza/theme";

import {BEATS} from "./timing";

const LOCKUP_CYCLE: HonzaOrbState[] = ["idle", "thinking", "speaking", "oops", "excited"];

export function moodAt(frame: number): HonzaOrbState {
  if (frame >= BEATS.lockup) {
    const step = 24;
    const index = Math.floor((frame - BEATS.lockup) / step) % LOCKUP_CYCLE.length;
    return LOCKUP_CYCLE[index];
  }
  if (frame >= BEATS.levelIn) return "idle";
  if (frame >= BEATS.startsIn) return "speaking";
  if (frame >= BEATS.callIn) return "speaking";
  if (frame >= BEATS.bringsBack) return "speaking";
  if (frame >= BEATS.fix) return "oops";
  if (frame >= BEATS.typeStart) return "thinking";
  if (frame >= BEATS.chatIn) return "speaking";
  if (frame >= BEATS.docIn) return "speaking";
  return "idle";
}
