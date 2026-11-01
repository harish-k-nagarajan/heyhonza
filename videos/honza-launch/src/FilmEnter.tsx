import type {ReactNode} from "react";

import {rise} from "./scene";
import {useCurrentFrame} from "remotion";

/** Same ease as the scenes. No spring, so nothing bounces. */
export function FilmEnter({
  appearAt,
  children,
  fromY = 12,
  align = "start",
}: {
  appearAt: number;
  children: ReactNode;
  fromY?: number;
  align?: "start" | "end";
}) {
  const frame = useCurrentFrame();
  const motion = rise(frame, appearAt, 12, fromY);

  return (
    <div
      className={align === "end" ? "flex w-full justify-end" : "flex w-full justify-start"}
      style={{
        opacity: motion.opacity,
        translate: motion.translate,
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  );
}
