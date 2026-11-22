import {INK} from "./copy";
import {interFamily} from "./fonts";
import {rise} from "./scene";

/** One sentence, in full, moving as one piece. */
export function Sentence({
  text,
  frame,
  at,
  size = 40,
  align = "left",
}: {
  text: string;
  frame: number;
  at: number;
  size?: number;
  align?: "left" | "center";
}) {
  const motion = rise(frame, Math.max(0, at - 10), 10, 8);
  return (
    <p
      style={{
        margin: 0,
        width: "100%",
        ...motion,
        fontFamily: interFamily,
        fontSize: size,
        lineHeight: 1.28,
        fontWeight: 500,
        letterSpacing: "-0.028em",
        color: INK,
        textAlign: align,
        hyphens: "manual",
      }}
    >
      {text}
    </p>
  );
}
