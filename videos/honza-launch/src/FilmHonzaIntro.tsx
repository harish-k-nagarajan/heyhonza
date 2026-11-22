import type {HonzaOrbState} from "@/components/honza/theme";
import {HmatPresenceRecess} from "@/components/screens/hmat/HmatUi";
import {interpolate} from "remotion";

import {INK} from "./copy";
import {dotoFamily, interFamily} from "./fonts";
import {CLAMP, EASE_OUT, progress, rise} from "./scene";
import {BEATS} from "./timing";

const ROLE_WORDS = ["tutor", "friend"] as const;
const DOTS = [-28, 0, 28];

/**
 * Glyph assembly on cream slate: dots settle into the ceramic recess, then
 * dominant "Introducing Honza." No orb roll over the city and no sticker on Prague.
 */
export function FilmHonzaIntro({
  frame,
  mood,
}: {
  frame: number;
  mood: HonzaOrbState;
}) {
  const title = rise(frame, BEATS.introTitle - 12, 10, 8);
  const rolesAt = BEATS.introTitle + 28;
  const leave = progress(frame, BEATS.notesMove - 6, BEATS.notesMove + 22, EASE_OUT);

  // City exit finishes at frame 342. Dots, then color, then the recess.
  const dotsIn = progress(frame, 346, 356, EASE_OUT);
  const colorIn = progress(frame, 354, 366, EASE_OUT);
  const recessIn = progress(frame, 358, 374, EASE_OUT);
  const dotFade = interpolate(recessIn, [0.15, 0.7], [1, 0], CLAMP);

  const roleSlot = frame >= rolesAt ? Math.floor((frame - rolesAt) / 42) % ROLE_WORDS.length : 0;
  const roleLocal = frame >= rolesAt ? (frame - rolesAt) % 42 : 0;
  const roleOpacity =
    frame < rolesAt
      ? 0
      : roleSlot === 0 && roleLocal < 8
        ? interpolate(roleLocal, [0, 8], [0, 1], CLAMP)
        : interpolate(roleLocal, [0, 6, 36, 42], [0.35, 1, 1, 0.35], CLAMP);

  const rootOpacity = interpolate(leave, [0, 0.55, 1], [1, 1, 0], CLAMP);
  const rootY = interpolate(leave, [0, 1], [0, -12], CLAMP);

  return (
    <div
      className="film-level"
      style={{
        width: 800,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: rootOpacity,
        translate: `0px ${rootY}px`,
      }}
    >
      <div style={{position: "relative", width: 220, height: 220, display: "flex", justifyContent: "center"}}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: dotsIn * dotFade,
          }}
        >
          {DOTS.map((y) =>
            DOTS.map((x) => (
              <span
                key={`${x}-${y}`}
                style={{
                  position: "absolute",
                  left: 110 + x - 7,
                  top: 110 + y - 7,
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  background: colorIn > 0.5 ? (x < 0 ? "#2E6A44" : "#E8432D") : INK,
                  opacity: 0.35 + colorIn * 0.65,
                  scale: 0.86 + dotsIn * 0.14,
                }}
              />
            )),
          )}
        </div>
        <div
          style={{
            position: "relative",
            opacity: recessIn,
            scale: 0.96 + recessIn * 0.04,
          }}
        >
          <HmatPresenceRecess orbState={mood} size={196} breathe={false} />
        </div>
      </div>

      <p
        style={{
          margin: "28px 0 0",
          textAlign: "center",
          color: INK,
          fontFamily: dotoFamily,
          fontSize: 52,
          fontWeight: 700,
          letterSpacing: "0.02em",
          lineHeight: 1.05,
          whiteSpace: "nowrap",
          opacity: title.opacity,
          translate: title.translate,
        }}
      >
        Introducing Honza.
      </p>

      <p
        style={{
          margin: "14px 0 0",
          textAlign: "center",
          fontFamily: interFamily,
          fontSize: 22,
          fontWeight: 500,
          letterSpacing: "-0.02em",
          color: INK,
          opacity: roleOpacity,
          minHeight: 28,
        }}
      >
        Your {ROLE_WORDS[roleSlot]}
      </p>
    </div>
  );
}