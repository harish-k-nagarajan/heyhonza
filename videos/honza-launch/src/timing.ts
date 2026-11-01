import {END_LINE, FREE_LINE, LINES} from "./copy";

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const PHONE_W = 430;
export const PHONE_H = 860;

/** Chat and call stage, unscaled, beside the rail. */
export const PHONE_SCALE = 1;

/**
 * Clear aloud pace, plus a short breath so the last word is not cut.
 * The first Prague line stays up through the two-second drawing.
 */
const WORDS_PER_MIN = 136;
const TAIL = 16;
const MIN_HOLD = 78;

export type Cue = {at: number; text: string};

export function holdFrames(text: string, min = MIN_HOLD) {
  const count = text.trim().split(/\s+/).length;
  const spoken = Math.ceil((count / WORDS_PER_MIN) * 60 * FPS) + TAIL;
  return Math.max(min, spoken);
}

function lay(lines: readonly string[], start: number, mins: readonly number[] = []) {
  const cues: Cue[] = [];
  let at = start;
  lines.forEach((text, index) => {
    cues.push({at, text});
    at += holdFrames(text, mins[index] ?? MIN_HOLD);
  });
  return {cues, end: at};
}

const prague = lay(LINES.prague, 0, [96]);
const notes = lay(LINES.notes, prague.end);
const chat = lay(LINES.chat, notes.end);
const call = lay(LINES.call, chat.end);
const starts = lay(LINES.starts, call.end);
const level = lay(LINES.level, starts.end);

const lockup = level.end;
const endCta = lockup + holdFrames(END_LINE);

export const RAILS = {
  prague: prague.cues,
  notes: notes.cues,
  chat: chat.cues,
  call: call.cues,
  starts: starts.cues,
  level: level.cues,
} as const;

export const BEATS = {
  docIn: prague.end,
  docBody: prague.end + 8,
  chatIn: notes.end,
  honzaOpen: chat.cues[1].at,
  typeStart: chat.cues[3].at + 4,
  send: chat.cues[4].at - 14,
  userBubble: chat.cues[4].at - 8,
  fix: chat.cues[4].at,
  bringsBack: chat.cues[5].at,
  callIn: chat.end,
  callSpeak: call.cues[1].at,
  startsIn: call.end,
  levelIn: starts.end,
  lockup,
  endCta,
} as const;

export const DURATION_IN_FRAMES = endCta + holdFrames(FREE_LINE) + 30;
