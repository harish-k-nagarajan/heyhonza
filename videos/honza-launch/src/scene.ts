import {Easing, interpolate} from "remotion";

/** Long ease-out, no bounce. */
export const APPLE = Easing.bezier(0.22, 1, 0.36, 1);

const ENTER_F = 18;
const ENTER_Y = 12;
const LEAVE_F = 8;
/** Leaving accelerates into the cut. */
export const LEAVE = Easing.bezier(0.55, 0.05, 0.9, 0.2);

export function sceneMotion(frame: number, enter: number, leave: number) {
  const enterMove = interpolate(frame, [enter, enter + ENTER_F], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: APPLE,
  });
  const enterFade = interpolate(frame, [enter, enter + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: APPLE,
  });
  const leaveP = interpolate(frame, [leave - LEAVE_F, leave], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: LEAVE,
  });
  const y = (1 - enterMove) * ENTER_Y - leaveP * 16;
  return {
    opacity: enterFade * (1 - leaveP),
    translate: `0px ${y}px`,
  };
}

export function inWindow(frame: number, enter: number, leave: number) {
  return frame >= enter && frame < leave;
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
