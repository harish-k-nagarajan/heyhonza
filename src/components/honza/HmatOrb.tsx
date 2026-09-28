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
 * Pen stage is 240×212; the ceramic body sits at (49, 2) and is 148×152.
 * Rays and motes are placed in that stage, then mapped onto the body box so
 * they land in the margin around the shell instead of under it.
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

/** Short ticks beside the shell — honza.pen Qj69R / MXzhl / Q92Mq / G6POZ. */
const RAYS = [
  { key: "lu", rot: -30, spin: -7, box: stageBox(12, 50, 15, 6), dx: "-2px", dy: "-3px", dur: "6.2s", delay: "0.1s" },
  { key: "ll", rot: -6, spin: 5, box: stageBox(8, 76, 14, 5), dx: "-3px", dy: "2px", dur: "7.8s", delay: "1.1s" },
  { key: "ru", rot: 30, spin: 6, box: stageBox(213, 54, 15, 6), dx: "2px", dy: "-2px", dur: "5.5s", delay: "0.45s" },
  { key: "rl", rot: 6, spin: -5, box: stageBox(216, 75, 14, 5), dx: "3px", dy: "2px", dur: "8.4s", delay: "1.7s" },
] as const;

/** Six motes — honza.pen Particles dsZv8 … k2JdF. Outward sprinkle from the shell. */
const PARTICLES = [
  { x: 30, y: 34, size: 5, delay: "0s", opacity: 1, dx: "-13px", dy: "-6px" },
  { x: 206, y: 26, size: 4, delay: "0.55s", opacity: 0.7, dx: "12px", dy: "-7px" },
  { x: 16, y: 118, size: 4, delay: "1.1s", opacity: 0.6, dx: "-13px", dy: "5px" },
  { x: 222, y: 104, size: 6, delay: "1.7s", opacity: 0.85, dx: "14px", dy: "4px" },
  { x: 44, y: 166, size: 3, delay: "2.2s", opacity: 0.5, dx: "-9px", dy: "10px" },
  { x: 194, y: 164, size: 4, delay: "2.8s", opacity: 0.65, dx: "9px", dy: "11px" },
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

  const showRays = hero && config.rays;
  const showParticles = hero && config.particles;
  const presence = useOrbPresence({
    enabled: hero && breathe,
    rotation: config.rotation,
    face,
    attentive,
    intensity: config.intensity,
  });

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
      }}
    >
      {showFloorLight ? (
        <div className="hmat-orb-ground" aria-hidden>
          <motion.div className="hmat-orb-aura" style={presence.auraStyle} />
          <motion.div className="hmat-orb-spill" style={presence.spillStyle} />
          <motion.div className="hmat-orb-occlusion" style={presence.shadowStyle} />
          <motion.div className="hmat-orb-shadow" style={presence.shadowStyle} />
          <motion.div className="hmat-orb-emissive" style={presence.emissiveStyle} />
          <motion.div className="hmat-orb-contact" style={presence.contactStyle} />
        </div>
      ) : null}

      <motion.div
        className={cn("hmat-orb-stage", popping && "react-pop")}
        style={presence.bodyStyle}
      >
        {showRays ? (
          <div className="hmat-orb-rays" aria-hidden>
            {RAYS.map((ray) => (
              <span
                key={ray.key}
                className={`hmat-orb-ray hmat-orb-ray--${ray.key}`}
                style={{
                  ...ray.box,
                  ["--ray-rot" as string]: `${ray.rot}deg`,
                  ["--ray-spin" as string]: `${ray.spin}deg`,
                  ["--ray-dx" as string]: ray.dx,
                  ["--ray-dy" as string]: ray.dy,
                  ["--ray-base" as string]: ray.dur,
                  animationDelay: ray.delay,
                }}
              />
            ))}
          </div>
        ) : null}

        {showParticles ? (
          <div className="hmat-orb-particles" aria-hidden>
            {PARTICLES.map((pt, i) => (
              <span
                key={i}
                className="hmat-orb-particle"
                style={{
                  ...stageBox(pt.x, pt.y, pt.size, pt.size),
                  animationDelay: pt.delay,
                  animationDuration: `${2.6 + (i % 5) * 0.72}s`,
                  ["--p-opacity" as string]: String(pt.opacity),
                  ["--dx" as string]: pt.dx,
                  ["--dy" as string]: pt.dy,
                }}
              />
            ))}
          </div>
        ) : null}

        {showFloorLight ? <div className="hmat-orb-halo" aria-hidden /> : null}
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
  );
}
