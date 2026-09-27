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
 */

const BODY_SPRING = { stiffness: 38, damping: 18, mass: 1.45 };
const GLOW_SPRING = { stiffness: 22, damping: 16, mass: 1.15 };

const ATTENTIVE_LEAN = -2.1;

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
  const listen = attentive ? 0.55 : 1;
  switch (face) {
    case "waiting":
      return { y: 2.1 * listen, x: 0.7 * listen, rot: 0.55, scale: 0.007, biasY: attentive ? 1.15 : 0, pace: 2400 };
    case "thinking":
      return { y: 2.4 * listen, x: 0.45, rot: 0.85, scale: 0.006, biasY: attentive ? 0.4 : -0.7, pace: 1700 };
    case "speaking":
      return { y: 2.2, x: 0.6, rot: 0.65, scale: 0.009, biasY: -1.7, pace: 1300 };
    case "happy":
      return { y: 2.8 * listen, x: 0.9, rot: 0.8, scale: 0.011, biasY: attentive ? -0.2 : -1.15, pace: 1500 };
    case "surprised":
      return { y: 1.1, x: 0.35, rot: 0.35, scale: 0.005, biasY: -2.2, pace: 900 };
    case "sad":
      return { y: 0.7, x: 0.15, rot: 0.2, scale: 0.003, biasY: 1.3, pace: 3200 };
    case "confused":
      return { y: 1.5, x: 1.05, rot: 1.25, scale: 0.004, biasY: 0.35, pace: 1100 };
    default: {
      const _never: never = face;
      return _never;
    }
  }
}

function reactionLift(face: CeramicFace): number {
  switch (face) {
    case "waiting":
      return -0.5;
    case "thinking":
      return -1.7;
    case "speaking":
      return -2.5;
    case "happy":
      return -2.1;
    case "surprised":
      return -3.2;
    case "sad":
      return 0.8;
    case "confused":
      return 0.4;
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

  const bodyTransform = useTransform([x, y, rot, scale], ([xv, yv, rv, sv]) => {
    return `translate3d(${num(xv)}px, ${num(yv)}px, 0) rotate(${num(rv)}deg) scale(${num(sv)})`;
  });

  const shiftX = useTransform([glowX, glowRot], ([px, rv]) => -num(px) * 0.4 - num(rv) * 0.55);

  const spillTransform = useTransform([shiftX, glowY], ([sx, gy]) => {
    const spread = 1 - num(gy) * 0.032;
    return `translate3d(${num(sx)}px, 0, 0) scale(${spread}, ${1 + (spread - 1) * 0.45})`;
  });
  const spillOpacity = useTransform([glowY, intensityMv], ([gy, i]) => clamp(0.86 - num(gy) * 0.03, 0.55, 1) * num(i));

  const emissiveTransform = useTransform([shiftX, glowY], ([sx, gy]) => {
    const spread = 1 - num(gy) * 0.04;
    return `translate3d(${num(sx) * 0.75}px, 0, 0) scale(${spread}, ${1 + (spread - 1) * 0.35})`;
  });
  const emissiveOpacity = useTransform([glowY, intensityMv], ([gy, i]) => clamp(0.92 + num(gy) * 0.035, 0.5, 1) * num(i));

  const shadowTransform = useTransform([shiftX, glowY], ([sx, gy]) => {
    const width = 1 + num(gy) * 0.05;
    const soft = 1 + num(gy) * 0.02;
    return `translate3d(${num(sx) * 1.15}px, 0, 0) scale(${width}, ${soft})`;
  });
  const shadowOpacity = useTransform([glowY, intensityMv], ([gy, i]) => clamp(0.62 + num(gy) * 0.07, 0.32, 0.9) * num(i));

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
    spillStyle: { transform: spillTransform, opacity: spillOpacity },
    emissiveStyle: { transform: emissiveTransform, opacity: emissiveOpacity },
    shadowStyle: { transform: shadowTransform, opacity: shadowOpacity },
    contactStyle: { transform: shadowTransform },
  };
}
