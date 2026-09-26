"use client";

import { useId, useMemo } from "react";

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

/**
 * Ceramic Honza — one porcelain body with an inset LED matrix, seated in the
 * recess. Faces swap from the pen atlas; glow / rays / particles follow the
 * face config. Compact sizes skip stage effects. `react-pop` plays the
 * surprised beat (~280ms via useReactPop), then the real mood returns.
 */

const HERO_MIN = 100;

const RAYS = [
  { className: "hmat-orb-ray hmat-orb-ray--lu", style: { left: "5%", top: "24%", transform: "rotate(-30deg)" } },
  { className: "hmat-orb-ray hmat-orb-ray--ll", style: { left: "3.5%", top: "37%", transform: "rotate(-6deg)" } },
  { className: "hmat-orb-ray hmat-orb-ray--ru", style: { right: "5%", top: "28%", transform: "rotate(30deg)" } },
  { className: "hmat-orb-ray hmat-orb-ray--rl", style: { right: "3.5%", top: "36%", transform: "rotate(6deg)" } },
] as const;

const PARTICLES = [
  { left: "12.5%", top: "16%", size: 5, delay: "0s", opacity: 1 },
  { left: "85.5%", top: "12%", size: 4, delay: "0.4s", opacity: 0.7 },
  { left: "6.5%", top: "56%", size: 4, delay: "0.9s", opacity: 0.6 },
  { left: "92.5%", top: "49%", size: 6, delay: "1.3s", opacity: 0.85 },
  { left: "18%", top: "78%", size: 3, delay: "1.8s", opacity: 0.5 },
  { left: "80.5%", top: "77%", size: 4, delay: "2.2s", opacity: 0.65 },
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
  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      viewBox={`0 0 ${CERAMIC_VIEW} ${CERAMIC_VIEW}`}
      aria-hidden
    >
      {pixels.map((px, i) => (
        <rect
          key={`${px.x}-${px.y}-${i}`}
          x={px.x}
          y={px.y}
          width={CERAMIC_PIXEL}
          height={CERAMIC_PIXEL}
          rx={1.08}
          fill={fill}
          opacity={px.o ?? 1}
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
};

export function HmatOrb({
  state = "idle",
  size = 150,
  breathe = true,
  className,
  stackClassName,
  attentive = false,
}: HmatOrbProps) {
  const hero = size >= HERO_MIN;
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
  const floatOn = hero && breathe;

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
      <div
        className={cn(
          "hmat-orb-stage",
          floatOn && "hmat-orb-stage--float",
          popping && "react-pop",
        )}
      >
        {hero ? (
          <>
            <div className="hmat-orb-aura" aria-hidden />
            <div className="hmat-orb-spill" aria-hidden />
            <div className="hmat-orb-shadow" aria-hidden />
            <div className="hmat-orb-contact" aria-hidden />
          </>
        ) : null}

        {showRays ? (
          <div className="hmat-orb-rays" aria-hidden>
            {RAYS.map((ray) => (
              <span key={ray.className} className={ray.className} style={ray.style} />
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
                  left: pt.left,
                  top: pt.top,
                  width: pt.size,
                  height: pt.size,
                  opacity: pt.opacity,
                  animationDelay: pt.delay,
                }}
              />
            ))}
          </div>
        ) : null}

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
      </div>
    </div>
  );
}
