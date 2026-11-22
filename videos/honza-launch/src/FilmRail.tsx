import type {Cue} from "./timing";
import {Sentence} from "./words";

/**
 * A chapter keeps its claim visible while the supporting thought appears
 * beneath it. Later lines stay. The viewer reads the whole stack.
 */
export function FilmRail({frame, lines}: {frame: number; lines: readonly Cue[]}) {
  const visible = lines.filter((cue) => frame >= cue.at);
  if (visible.length === 0) return null;
  const primary = visible[0];
  const supporting = visible.slice(1);
  const dense = lines.length >= 4;

  return (
    <div style={{width: "100%", maxWidth: 600}}>
      <Sentence text={primary.text} frame={frame} at={primary.at} size={dense ? 38 : 42} />
      {supporting.map((cue, index) => (
        <div key={cue.at} style={{marginTop: index === 0 ? 18 : 10, opacity: index === 0 ? 0.92 : 0.8}}>
          <Sentence text={cue.text} frame={frame} at={cue.at} size={index === 0 ? (dense ? 24 : 26) : 22} />
        </div>
      ))}
    </div>
  );
}
