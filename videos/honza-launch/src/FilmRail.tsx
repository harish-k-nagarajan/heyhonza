import type {Cue} from "./timing";
import {Sentence} from "./words";

/** One full sentence at a time. It rises as a whole, then holds. */
export function FilmRail({frame, lines}: {frame: number; lines: readonly Cue[]}) {
  let line: Cue | null = null;
  for (const cue of lines) {
    if (frame >= cue.at) line = cue;
  }
  if (!line) return null;

  return <Sentence text={line.text} frame={frame} at={line.at} />;
}
