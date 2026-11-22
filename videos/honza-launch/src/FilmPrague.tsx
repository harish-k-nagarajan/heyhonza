import {interpolate, Img, staticFile} from "remotion";

import {CORAL, INK} from "./copy";
import {cityExit, CLAMP, EASE_OUT} from "./scene";
import {BEATS} from "./timing";
import {TRAVELER_BOX, TRAVELER_STROKES} from "./prague-trace";

const TRAVELER_AT = [136, 150, 164, 178];

const drawn = (frame: number, at: number, dur: number) =>
  interpolate(frame, [at, at + dur], [1, 0], {...CLAMP, easing: EASE_OUT});

/**
 * Pen guides that lead the plate. The colored panorama is the real Vltava
 * outline (Castle, Charles Bridge, Týn, museum band, Žižkov), not a second skyline.
 */
const GUIDES = [
  {d: "M18 214 C80 214 160 208 250 206 C340 204 430 210 504 214", at: 0, dur: 28},
  {d: "M20 186 H500", at: 10, dur: 26},
  {d: "M36 176 C48 150 58 128 70 122 C82 132 92 124 108 148 C120 166 132 160 148 172", at: 22, dur: 26},
  {d: "M214 170 L226 108 L234 62 L242 28 L250 62 L258 108 L268 170", at: 36, dur: 24},
  {d: "M268 170 L278 112 L286 48 L294 112 L306 170", at: 44, dur: 22},
  {d: "M478 174 V52", at: 54, dur: 20},
] as const;

/**
 * Left stage for Act I.
 * Outline guides draw on, then the colored Vltava plate. The traveler walks in
 * along the embankment. No speech bubble.
 */
export function FilmPrague({frame}: {frame: number}) {
  const exit = cityExit(frame, BEATS.pragueExit);
  const plateSrc = staticFile("prague-panorama-color.png");
  const travelerSrc = staticFile("prague-traveler.png");
  const tramX = interpolate(frame, [124, 292], [286, 438], CLAMP);
  const tramOn = interpolate(frame, [116, 134], [0, 1], {...CLAMP, easing: EASE_OUT});
  const walkX = interpolate(frame, [120, 188], [-78, 0], {...CLAMP, easing: EASE_OUT});
  const travelerFill = interpolate(frame, [186, 214], [0, 1], {...CLAMP, easing: EASE_OUT});
  const plateOn = interpolate(frame, [52, 84], [0, 1], {...CLAMP, easing: EASE_OUT});
  const guideOn = interpolate(frame, [64, 82], [1, 0], {...CLAMP, easing: EASE_OUT});
  const phoneGlow =
    frame >= 228 && frame < 292 ? 0.28 + 0.5 * Math.abs(Math.sin((frame - 228) * 0.21)) : 0;

  return (
    <div
      style={{
        width: 820,
        height: 640,
        position: "relative",
        opacity: exit.opacity,
        scale: exit.scale,
        translate: exit.translate,
      }}
    >
      <Img src={plateSrc} style={{position: "absolute", width: 1, height: 1, opacity: 0}} />
      <Img src={travelerSrc} style={{position: "absolute", width: 1, height: 1, opacity: 0}} />

      <svg
        width={800}
        height={431}
        viewBox="0 0 520 280"
        style={{position: "absolute", left: 10, top: 8, overflow: "visible"}}
        aria-hidden
      >
        <image href={plateSrc} width={520} height={250} y={8} opacity={plateOn} />

        <g opacity={guideOn}>
          {GUIDES.map((guide) => (
            <path
              key={guide.d}
              d={guide.d}
              fill="none"
              stroke={INK}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={drawn(frame, guide.at, guide.dur)}
            />
          ))}
        </g>

        <g opacity={tramOn * plateOn} transform={`translate(${tramX} 168)`}>
          <path d="M2 14 H62 V3 H14 L4 12 Z" fill={CORAL} stroke={INK} strokeWidth={1.1} />
          <path d="M16 5 H24 V11 H16 Z M30 5 H38 V11 H30 Z M44 5 H52 V11 H44 Z" fill="#FFFDFB" />
          <circle cx={16} cy={15.4} r={2} fill={INK} />
          <circle cx={48} cy={15.4} r={2} fill={INK} />
        </g>
      </svg>

      <svg
        width={210}
        height={290}
        viewBox={`0 0 ${TRAVELER_BOX.w} ${TRAVELER_BOX.h}`}
        style={{position: "absolute", left: 18, top: 292, translate: `${walkX}px 0px`}}
        aria-hidden
      >
        <g opacity={interpolate(frame, [136, 170], [0, 1], {...CLAMP, easing: EASE_OUT})}>
          <ellipse cx={143} cy={82} rx={72} ry={68} fill="#F5F2EE" />
          <path
            d="M86 168 C58 230 48 340 72 455 L96 500 L198 504 L226 460 C252 340 236 230 206 168 C176 148 118 148 86 168 Z"
            fill="#F5F2EE"
          />
        </g>
        <mask
          id="traveler-ink"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={TRAVELER_BOX.w}
          height={TRAVELER_BOX.h}
        >
          {TRAVELER_STROKES.map((stroke) => (
            <path
              key={`${stroke.ink}-${stroke.band}`}
              d={stroke.d}
              fill="none"
              stroke="#ffffff"
              strokeWidth={1.8}
              strokeLinecap="butt"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={drawn(frame, TRAVELER_AT[stroke.band], 22)}
            />
          ))}
        </mask>
        <image
          href={travelerSrc}
          width={TRAVELER_BOX.w}
          height={TRAVELER_BOX.h}
          mask="url(#traveler-ink)"
          opacity={1 - travelerFill}
        />
        <image href={travelerSrc} width={TRAVELER_BOX.w} height={TRAVELER_BOX.h} opacity={travelerFill} />
        <circle cx={268} cy={158} r={22} fill="#E8432D" opacity={phoneGlow * 0.35} />
      </svg>
    </div>
  );
}
