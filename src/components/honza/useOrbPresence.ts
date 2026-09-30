"use client";

import { useEffect, useRef } from "react";
import {
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

import type { CeramicFace } from "./ceramic-faces";

/**
 * Ceramic presence — one heavy body spring, and a slower ground spring that
 * follows it. Wander targets are irregular so the path is settling, not a
 * sine. State changes dip (notice), then lean into the new pose (react),
 * then the wander loop takes back over (settle).
 *
 * Soft cast shadow stays on the card: origin at the ellipse top so lift opens
 * the floor, and lateral throw grows with height. Contact stays under the rim.
 */

/** Heavy ceramic. Overdamped so it settles instead of oscillating. */
const BODY_SPRING = { stiffness: 52, damping: 19, mass: 1.4 };
/** Light and shadow lag the body — softer, slower, still overdamped. */
const GLOW_SPRING = { stiffness: 22, damping: 18, mass: 1.5 };

const ATTENTIVE_LEAN = -2.1;
const ATTENTIVE_LIFT = -1.25;

type Drift = {
  y: number;
  x: number;
  rot: number;
  scale: number;
  biasY: number;
  /** Milliseconds between new wander targets. */
  pace: number;
};

function driftFor(face: CeramicFace, attentive: boolean): Drift {
  const listen = attentive ? 0.42 : 1;
  const notice = attentive ? ATTENTIVE_LIFT : 0;
  switch (face) {
    case "waiting":
      return { y: 10 * listen, x: 5.5 * listen, rot: 1.4, scale: 0.012, biasY: notice, pace: 2400 };
    case "thinking":
      return { y: 2.6 * listen, x: 0.65 * listen, rot: 0.85, scale: 0.006, biasY: notice - 1.1, pace: 2200 };
    case "speaking":
      return { y: 2.4 * listen, x: 0.75 * listen, rot: 0.5, scale: 0.01, biasY: notice - 2.2, pace: 1600 };
    case "happy":
      return { y: 3.1 * listen, x: 1.15 * listen, rot: 0.7, scale: 0.011, biasY: notice - 1.4, pace: 1900 };
    case "surprised":
      return { y: 1.15, x: 0.35, rot: 0.35, scale: 0.004, biasY: notice - 3.2, pace: 1100 };
    case "sad":
      return { y: 0.75 * listen, x: 0.18 * listen, rot: 0.16, scale: 0.003, biasY: notice + 1.5, pace: 4400 };
    case "confused":
      return { y: 1.55 * listen, x: 1.25 * listen, rot: 1.1, scale: 0.004, biasY: notice + 0.35, pace: 1500 };
    default: {
      const _never: never = face;
      return _never;
    }
  }
}

function reactionLift(face: CeramicFace): number {
  switch (face) {
    case "waiting":
      return -0.6;
    case "thinking":
      return -2.2;
    case "speaking":
      return -3.1;
    case "happy":
      return -2.4;
    case "surprised":
      return -3.8;
    case "sad":
      return 1.1;
    case "confused":
      return 0.45;
    default: {
      const _never: never = face;
      return _never;
    }
  }
}

function reactionTilt(face: CeramicFace): number {
  switch (face) {
    case "thinking":
      return 1.1;
    case "surprised":
      return -1.8;
    case "confused":
      return 0.8;
    case "happy":
      return 0.6;
    case "speaking":
      return 0.4;
    case "waiting":
    case "sad":
      return 0;
    default: {
      const _never: never = face;
      return _never;
    }
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function num(value: unknown) {
  return typeof value === "number" ? value : 0;
}

/** Lateral throw grows as the body rises — high orb casts farther. */
function lateralThrow(gx: number, lift: number, gain = 0.09) {
  return gx * (1 + clamp(lift, 0, 10) * gain);
}

export function useOrbPresence({
  enabled,
  rotation,
  face,
  attentive,
  intensity,
}: {
  enabled: boolean;
  rotation: number;
  face: CeramicFace;
  attentive: boolean;
  intensity: number;
}) {
  const reduce = useReducedMotion();
  const driftRef = useRef(driftFor(face, attentive));
  const restRotRef = useRef(rotation);
  const lockRef = useRef(0);
  const skipNotice = useRef(true);
  const prevFace = useRef(face);

  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const targetRot = useMotionValue(rotation);
  const targetScale = useMotionValue(1);
  const intensityMv = useMotionValue(intensity);

  const x = useSpring(targetX, BODY_SPRING);
  const y = useSpring(targetY, BODY_SPRING);
  const rot = useSpring(targetRot, BODY_SPRING);
  const scale = useSpring(targetScale, { stiffness: 48, damping: 18, mass: 1.05 });

  const glowX = useSpring(x, GLOW_SPRING);
  const glowY = useSpring(y, GLOW_SPRING);
  const glowRot = useSpring(rot, GLOW_SPRING);
  /** Positive when the body is above its rest line. */
  const lift = useTransform(glowY, (gy) => -num(gy));

  const bodyTransform = useTransform([x, y, rot, scale], ([xv, yv, rv, sv]) => {
    const tilt = clamp(-num(yv) * 0.26, -1.35, 1.35);
    return `translate3d(${num(xv)}px, ${num(yv)}px, 0) rotate(${num(rv)}deg) rotateX(${tilt}deg) scale(${num(sv)})`;
  });

  const auraTransform = useTransform([glowX, lift], ([gx, lv]) => {
    const L = num(lv);
    const spread = clamp(1 + L * 0.045, 0.92, 1.16);
    return `translate3d(${lateralThrow(num(gx), L, 0.05) * 0.55}px, 0, 0) scale(${spread})`;
  });
  const auraOpacity = useTransform([lift, intensityMv], ([lv, i]) => clamp(0.96 - num(lv) * 0.04, 0.7, 1) * num(i));

  const spillTransform = useTransform([glowX, lift], ([gx, lv]) => {
    const L = num(lv);
    const spread = clamp(1 + L * 0.07, 0.9, 1.22);
    return `translate3d(${lateralThrow(num(gx), L, 0.06)}px, 0, 0) scale(${spread}, ${1 + (spread - 1) * 0.45})`;
  });
  const spillOpacity = useTransform([lift, intensityMv], ([lv, i]) => clamp(0.96 - num(lv) * 0.06, 0.62, 1) * num(i));

  const emissiveTransform = useTransform([glowX, lift], ([gx, lv]) => {
    const L = num(lv);
    const spread = clamp(1 + L * 0.085, 0.86, 1.24);
    return `translate3d(${lateralThrow(num(gx), L, 0.055) * 0.92}px, 0, 0) scale(${spread}, ${1 + (spread - 1) * 0.35})`;
  });
  const emissiveOpacity = useTransform([lift, intensityMv], ([lv, i]) => clamp(1 - num(lv) * 0.08, 0.58, 1) * num(i));

  /** Soft cast — wider / flatter / fainter when high; opposite lean from body tilt. */
  const shadowTransform = useTransform([glowX, glowRot, lift], ([gx, rv, lv]) => {
    const L = num(lv);
    const width = clamp(1 + L * 0.055, 0.78, 1.55);
    const height = clamp(1 - L * 0.045, 0.52, 1.12);
    const lean = clamp(-num(rv) * 0.4, -3.5, 3.5);
    return `translate3d(${lateralThrow(num(gx), L, 0.1)}px, 0, 0) rotate(${lean}deg) scale(${width}, ${height})`;
  });
  const shadowOpacity = useTransform([lift, intensityMv], ([lv, i]) => {
    const L = num(lv);
    return clamp(1 - L * 0.045, 0.28, 1) * num(i);
  });
  const shadowFilter = useTransform(lift, (lv) => {
    const extra = clamp(num(lv) * 0.55, 0, 7);
    return extra > 0.15 ? `blur(${extra.toFixed(2)}px)` : "none";
  });

  /** Occlusion + contact stay nearly under the rim — small lateral, little scale. */
  const contactTransform = useTransform([glowX, lift], ([gx, lv]) => {
    const L = num(lv);
    const tuck = clamp(1 - L * 0.025, 0.92, 1.05);
    return `translate3d(${num(gx) * 0.32}px, 0, 0) scale(${tuck}, ${tuck})`;
  });
  const contactOpacity = useTransform([lift, intensityMv], ([lv, i]) => {
    const L = num(lv);
    return clamp(1 - L * 0.05, 0.7, 1) * num(i);
  });

  useEffect(() => {
    intensityMv.set(intensity);
  }, [intensity, intensityMv]);

  useEffect(() => {
    driftRef.current = driftFor(face, attentive);
    restRotRef.current = rotation + (attentive ? ATTENTIVE_LEAN : 0);

    const from = prevFace.current;
    const faceChanged = from !== face;
    prevFace.current = face;

    const rest = restRotRef.current;
    const bias = driftRef.current.biasY;

    if (!enabled || reduce !== false) {
      targetX.set(0);
      targetY.set(bias);
      targetRot.set(rest);
      targetScale.set(1);
      return;
    }

    if (skipNotice.current) {
      skipNotice.current = false;
      targetX.set(0);
      targetY.set(bias);
      targetRot.set(rest);
      targetScale.set(1);
      return;
    }

    if (!faceChanged) {
      targetY.set(bias);
      targetRot.set(rest);
      return;
    }

    if (from === "surprised") {
      lockRef.current = performance.now() + 480;
      targetY.set(bias);
      targetRot.set(rest);
      targetScale.set(1);
      targetX.set(0);
      const release = window.setTimeout(() => {
        lockRef.current = 0;
      }, 460);
      return () => window.clearTimeout(release);
    }

    lockRef.current = performance.now() + 700;
    targetY.set(1.6);
    targetScale.set(0.988);
    targetRot.set(rest);
    targetX.set(0);

    const react = window.setTimeout(() => {
      targetY.set(bias + reactionLift(face));
      targetRot.set(rest + reactionTilt(face));
      targetScale.set(face === "surprised" ? 1.02 : 1.006);
    }, 120);

    const settle = window.setTimeout(() => {
      targetScale.set(1);
      targetY.set(bias);
      lockRef.current = 0;
    }, 660);

    return () => {
      window.clearTimeout(react);
      window.clearTimeout(settle);
    };
  }, [enabled, reduce, face, attentive, rotation, targetX, targetY, targetRot, targetScale]);

  useEffect(() => {
    driftRef.current = driftFor(face, attentive);
    restRotRef.current = rotation + (attentive ? ATTENTIVE_LEAN : 0);
    if (!enabled || reduce !== false) return;
    let timer = 0;
    let stopped = false;

    const tick = () => {
      if (stopped) return;
      if (performance.now() < lockRef.current) {
        timer = window.setTimeout(tick, 160);
        return;
      }
      const d = driftRef.current;
      targetY.set(d.biasY + (Math.random() * 2 - 1) * d.y);
      targetX.set((Math.random() * 2 - 1) * d.x);
      targetRot.set(restRotRef.current + (Math.random() * 2 - 1) * d.rot);
      targetScale.set(1 + (Math.random() * 2 - 1) * d.scale);
      timer = window.setTimeout(tick, d.pace * (0.75 + Math.random() * 0.7));
    };

    timer = window.setTimeout(tick, 900);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [enabled, reduce, face, attentive, rotation, targetX, targetY, targetRot, targetScale]);

  return {
    bodyStyle: { transform: bodyTransform },
    auraStyle: { transform: auraTransform, opacity: auraOpacity },
    spillStyle: { transform: spillTransform, opacity: spillOpacity },
    emissiveStyle: { transform: emissiveTransform, opacity: emissiveOpacity },
    occlusionStyle: { transform: contactTransform, opacity: contactOpacity },
    shadowStyle: {
      transform: shadowTransform,
      opacity: shadowOpacity,
      filter: shadowFilter,
    },
    contactStyle: { transform: contactTransform, opacity: contactOpacity },
  };
}
