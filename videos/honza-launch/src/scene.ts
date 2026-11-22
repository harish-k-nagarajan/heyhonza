import {Easing, interpolate} from "remotion";

/** Long ease-out, no bounce — used by rise and the notification spring. */
export const APPLE = Easing.bezier(0.22, 1, 0.36, 1);

/** Enter / settle. Matches animate skill --ease-out. */
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

/** On-screen travel. Matches animate skill --ease-in-out. */
export const EASE_MOVE = Easing.bezier(0.77, 0, 0.175, 1);

export const CLAMP = {extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const};

export function progress(
  frame: number,
  from: number,
  to: number,
  easing: typeof EASE_OUT = EASE_OUT,
) {
  return interpolate(frame, [from, to], [0, 1], {...CLAMP, easing});
}

/**
 * One iOS-style notification spring. 22px settle, about 1.6% scale overshoot, then rest.
 * Opacity, travel, and scale only.
 */
export function notifySpring(frame: number, at: number) {
  const local = frame - at;
  const opacity = interpolate(local, [0, 7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: APPLE,
  });
  const y = interpolate(local, [0, 11, 17], [22, -1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: APPLE,
  });
  const scale = interpolate(local, [0, 11, 17], [0.985, 1.016, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: APPLE,
  });
  return {opacity, translate: `0px ${y}px`, scale};
}

/** A whole sentence: 8px over 10 frames, unless a caller asks for another travel. */
export function rise(frame: number, at: number, frames = 10, distance = 8) {
  const move = interpolate(frame, [at, at + frames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: APPLE,
  });
  return {
    opacity: move,
    translate: `0px ${(1 - move) * distance}px`,
  };
}

/** Prague 288–330: scale to 0.82, drift up-left, fade only in the last third. */
export function cityExit(frame: number, at: number, until = at + 42) {
  const p = progress(frame, at, until, EASE_MOVE);
  return {
    opacity: interpolate(p, [0, 0.66, 1], [1, 1, 0], CLAMP),
    scale: interpolate(p, [0, 1], [1, 0.82], CLAMP),
    translate: `${interpolate(p, [0, 1], [0, -78], CLAMP)}px ${interpolate(p, [0, 1], [0, -46], CLAMP)}px`,
  };
}

/**
 * Orb roll onto the stage. Starts 180px left, −28deg, scale 0.86.
 * Settles over ~28 frames with a small rotational overshoot. Never fades in. Never scale(0).
 */
export function orbRoll(frame: number, at: number, settle = 28) {
  const p = progress(frame, at, at + settle, EASE_OUT);
  const rotate = interpolate(frame, [at, at + 22, at + settle], [-28, 4, 0], {
    ...CLAMP,
    easing: EASE_OUT,
  });
  return {
    x: interpolate(p, [0, 1], [-180, 0], CLAMP),
    rotate,
    scale: interpolate(p, [0, 1], [0.86, 1], CLAMP),
    bloom: interpolate(p, [0, 0.55, 1], [0.2, 1, 0.42], CLAMP),
  };
}
