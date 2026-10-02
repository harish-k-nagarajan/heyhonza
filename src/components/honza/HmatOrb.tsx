"use client";

import { useId, useMemo } from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/cn";
import {
  CERAMIC_FACE_CONFIG,
  CERAMIC_FACES,
  CERAMIC_PIXEL,
  CERAMIC_VIEW,
  ORB_LED,
  moodToCeramicFace,
  type CeramicFace,
  type CeramicPixel,
} from "./ceramic-faces";
import type { HonzaOrbState } from "./theme";
import { useOrbPresence } from "./useOrbPresence";

/**
 * Ceramic Honza — one porcelain body with an inset LED matrix, seated in the
 * recess. Faces swap from the pen atlas; glow / rays / particles follow the
 * face config. Compact sizes skip stage effects. `react-pop` plays the
 * surprised beat (~280ms via useReactPop), then the real mood returns.
 */

const HERO_MIN = 100;

/**
 * Pen stage is 240×212; the ceramic body sits at (49, 2) and is 148×152
 * (slightly taller than wide). The product box stays square. Hero maps that
 * body onto the square; rays, motes, and floor light are percentages of it.
 * Speech rays live in the unrotated stage — they follow the body's X/Y
 * translate and do not inherit tilt or scale. Pen rotation is CCW around
 * the top-left; CSS rotate() is CW, so each stored angle is sign-flipped.
 */
const BODY = { x: 49, y: 2, w: 148, h: 152 } as const;

function stageBox(x: number, y: number, w: number, h: number) {
  return {
    left: `${((x - BODY.x) / BODY.w) * 100}%`,
    top: `${((y - BODY.y) / BODY.h) * 100}%`,
    width: `${(w / BODY.w) * 100}%`,
    height: `${(h / BODY.h) * 100}%`,
  };
}

/**
 * Short ticks beside the shell — honza.pen Qj69R / MXzhl / Q92Mq / G6POZ.
 * `rot` is the CSS angle (pen CCW negated): left-upper reads as a backslash.
 */
const RAYS = [
  { key: "lu", rot: 30, box: stageBox(13, 52, 15, 5), dur: "4.2s", delay: "0.12s" },
  { key: "ll", rot: 6, box: stageBox(9, 78, 15, 5), dur: "4.8s", delay: "1.35s" },
  { key: "ru", rot: -30, box: stageBox(213, 61, 15, 5), dur: "4.5s", delay: "0.7s" },
  { key: "rl", rot: -6, box: stageBox(216, 77, 15, 5), dur: "5.1s", delay: "2.05s" },
] as const;

/** Six motes — honza.pen Particles dsZv8 … k2JdF. */
const PARTICLES = [
  { x: 30, y: 34, size: 5, delay: "0s", opacity: 1, dx: "-12px", dy: "-34px", dur: "3.4s" },
  { x: 206, y: 26, size: 4, delay: "0.55s", opacity: 0.7, dx: "11px", dy: "-36px", dur: "3.8s" },
  { x: 16, y: 118, size: 4, delay: "1.15s", opacity: 0.6, dx: "-14px", dy: "-28px", dur: "3.2s" },
  { x: 222, y: 104, size: 6, delay: "1.7s", opacity: 0.85, dx: "13px", dy: "-30px", dur: "3.9s" },
  { x: 44, y: 166, size: 3, delay: "2.25s", opacity: 0.5, dx: "-10px", dy: "-32px", dur: "3.1s" },
  { x: 194, y: 164, size: 4, delay: "2.85s", opacity: 0.65, dx: "10px", dy: "-34px", dur: "3.6s" },
] as const;

function PixelLayer({
  pixels,
  className,
  fill,
}: {
  pixels: CeramicPixel[];
  className?: string;
  fill: string;
}) {
  const fid = `led${useId().replace(/:/g, "")}`;
  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      viewBox={`0 0 ${CERAMIC_VIEW} ${CERAMIC_VIEW}`}
      aria-hidden
    >
      <defs>
        <filter id={fid} x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.42" result="bleed" />
          <feFlood floodColor={ORB_LED} floodOpacity="0.5" result="warm" />
          <feComposite in="warm" in2="bleed" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {pixels.map((px, i) => (
        <rect
          key={`${px.x}-${px.y}-${i}`}
          x={px.x}
          y={px.y}
          width={CERAMIC_PIXEL}
          height={CERAMIC_PIXEL}
          rx={0.7}
          fill={fill}
          opacity={px.o ?? 1}
          filter={`url(#${fid})`}
        />
      ))}
    </svg>
  );
}

function FaceLayers({ face, led }: { face: CeramicFace; led: string }) {
  const map = CERAMIC_FACES[face];
  const openEyes = useMemo(() => [...map.eyes, ...map.cheeks], [map]);
  const blinkEyes = useMemo(() => [...map.blink, ...map.cheeks], [map]);
  const isSpeaking = face === "speaking";

  return (
    <div className="hmat-orb-face" data-face={face}>
      <div className="hmat-orb-eyes hmat-orb-eyes--open">
        <PixelLayer pixels={openEyes} fill={led} />
      </div>
      <div className="hmat-orb-eyes hmat-orb-eyes--blink">
        <PixelLayer pixels={blinkEyes} fill={led} />
      </div>
      {isSpeaking ? (
        <>
          <div className="hmat-orb-mouth hmat-orb-mouth--open">
            <PixelLayer pixels={map.mouth} fill={led} />
          </div>
          <div className="hmat-orb-mouth hmat-orb-mouth--mid">
            <PixelLayer pixels={map.mouthMid ?? map.mouth} fill={led} />
          </div>
          <div className="hmat-orb-mouth hmat-orb-mouth--wide">
            <PixelLayer pixels={map.mouthWide ?? map.mouth} fill={led} />
          </div>
        </>
      ) : (
        <div className="hmat-orb-mouth hmat-orb-mouth--static">
          <PixelLayer pixels={map.mouth} fill={led} />
        </div>
      )}
    </div>
  );
}

export type HmatOrbProps = {
  state?: HonzaOrbState;
  /** Pixel size of the square orb body. */
  size?: number;
  /** Slow floating / breathing. On by default; off for small inline avatars. */
  breathe?: boolean;
  className?: string;
  /** Extra class on the stage — used to trigger the react-pop / surprised beat. */
  stackClassName?: string;
  /** Composer focus / call listening — lean in, pause blinks. */
  attentive?: boolean;
  /** Hero floor pool / halo under the body (off for compact auth wells). */
  floorLight?: boolean;
};

export function HmatOrb({
  state = "idle",
  size = 150,
  breathe = true,
  className,
  stackClassName,
  attentive = false,
  floorLight = true,
}: HmatOrbProps) {
  const hero = size >= HERO_MIN;
  const showFloorLight = hero && floorLight;
  const popping = stackClassName === "react-pop";
  const face: CeramicFace = popping ? "surprised" : moodToCeramicFace(state);
  const config = CERAMIC_FACE_CONFIG[face];
  const uid = useId();
  const blinkDelay = useMemo(() => {
    let h = 0;
    for (let i = 0; i < uid.length; i++) h = (h * 31 + uid.charCodeAt(i)) | 0;
    return `${-((Math.abs(h) % 450) / 100).toFixed(2)}s`;
  }, [uid]);

  const raysOn = hero && config.rays;
  const particlesOn = hero && config.particles;
  const presence = useOrbPresence({
    enabled: hero && breathe,
    rotation: config.rotation,
    face,
    attentive,
    intensity: config.intensity,
  });
  /** One pen-pixel, scaled so the 152-tall body fills the square. */
  const orbPx = `${size / BODY.h}px`;

  return (
    <div
      className={cn("hmat-orb", hero ? "hmat-orb--hero" : "hmat-orb--compact", className)}
      data-orb={state}
      data-face={face}
      data-attentive={attentive ? "true" : undefined}
      style={{
        width: size,
        height: size,
        ["--orb-glow" as string]: config.glow,
        ["--orb-led" as string]: ORB_LED,
        ["--orb-rotation" as string]: `${config.rotation}deg`,
        ["--orb-intensity" as string]: String(config.intensity),
        ["--orb-blink-delay" as string]: blinkDelay,
        ["--orb-px" as string]: orbPx,
      }}
    >
      <div
        className="hmat-orb-metrics"
        style={
          hero
            ? { width: (size * BODY.w) / BODY.h, height: size }
            : undefined
        }
      >
        {showFloorLight ? (
          <>
            <motion.div className="hmat-orb-aura" style={presence.auraStyle} />
            <motion.div className="hmat-orb-halo-pivot" style={presence.bodyStyle}>
              <div className="hmat-orb-halo" />
            </motion.div>
            <div className="hmat-orb-ground" aria-hidden>
              <motion.div className="hmat-orb-spill" style={presence.spillStyle} />
              <motion.div className="hmat-orb-shadow" style={presence.shadowStyle}>
                <span className="hmat-orb-shadow-fill" />
              </motion.div>
              <motion.div className="hmat-orb-emissive" style={presence.emissiveStyle} />
              <motion.div className="hmat-orb-contact" style={presence.contactStyle} />
            </div>
          </>
        ) : null}

        {hero ? (
          <motion.div
            className={cn("hmat-orb-rays", raysOn && "is-on")}
            style={presence.rayStyle}
            aria-hidden
          >
            {RAYS.map((ray) => (
              <span
                key={ray.key}
                className={`hmat-orb-ray hmat-orb-ray--${ray.key}`}
                style={{
                  ...ray.box,
                  ["--ray-rot" as string]: `${ray.rot}deg`,
                  ["--ray-base" as string]: ray.dur,
                  ["--ray-enter-delay" as string]: ray.delay,
                }}
              />
            ))}
          </motion.div>
        ) : null}

        {hero ? (
          <div className={cn("hmat-orb-particles", particlesOn && "is-on")} aria-hidden>
            {PARTICLES.map((pt, i) => (
              <span
                key={i}
                className="hmat-orb-particle"
                style={{
                  ...stageBox(pt.x, pt.y, pt.size, pt.size),
                  animationDelay: pt.delay,
                  animationDuration: pt.dur,
                  ["--p-opacity" as string]: String(pt.opacity),
                  ["--dx" as string]: pt.dx,
                  ["--dy" as string]: pt.dy,
                }}
              />
            ))}
          </div>
        ) : null}

        <motion.div
          className={cn("hmat-orb-stage", popping && "react-pop")}
          style={presence.bodyStyle}
        >
          {hero ? <div className="hmat-orb-weight" aria-hidden /> : null}
          <div className="hmat-orb-body">
            <div className="hmat-orb-porcelain" aria-hidden />
            <div className="hmat-orb-ceramic" aria-hidden />
            <div className="hmat-orb-sheen" aria-hidden />
            <div className="hmat-orb-specular" aria-hidden />
            <div className="hmat-orb-rim-right" aria-hidden />
            <div className="hmat-orb-rim-bottom" aria-hidden />
            <div className="hmat-orb-bezel" aria-hidden />
            <div className="hmat-orb-matrix">
              <div className="hmat-orb-matrix-dots" aria-hidden />
              <FaceLayers face={face} led={`var(--orb-led, ${ORB_LED})`} />
              <div className="hmat-orb-glass" aria-hidden />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
