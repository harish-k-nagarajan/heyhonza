/**
 * Ceramic Honza face atlas — 96×96 pixel maps from honza.pen `HonzaFace — *`
 * (pixel size ~4.92). Product moods map onto these faces; surprised/sad exist
 * in the atlas only (surprised = send beat; sad is unused by product events).
 */

import type { HonzaOrbState } from "./theme";

export type CeramicFace =
  | "waiting"
  | "thinking"
  | "speaking"
  | "happy"
  | "surprised"
  | "sad"
  | "confused";

export type CeramicPixel = {
  x: number;
  y: number;
  /** 0..1 opacity; cheeks are dimmer than eyes/mouth. */
  o?: number;
};

export type CeramicFaceMap = {
  eyes: CeramicPixel[];
  blink: CeramicPixel[];
  cheeks: CeramicPixel[];
  mouth: CeramicPixel[];
  /** Speaking only — alternate mouth shapes for the talk cycle. */
  mouthMid?: CeramicPixel[];
  mouthWide?: CeramicPixel[];
};

const CELL = 4.92;
/** Grid step between adjacent lit pixels (pen places ~4.92px cells on a 6px lattice). */
const STEP = 6;

/** Pen pixel size on the 96×96 matrix. */
export const CERAMIC_PIXEL = CELL;
export const CERAMIC_VIEW = 96;

const p = (x: number, y: number, o?: number): CeramicPixel =>
  o === undefined ? { x, y } : { x, y, o };

const rect = (x0: number, y0: number, cols: number, rows: number, o?: number): CeramicPixel[] => {
  const out: CeramicPixel[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out.push(p(x0 + c * STEP, y0 + r * STEP, o));
    }
  }
  return out;
};

const eye2 = (x: number, y: number) => rect(x, y, 2, 2);
const eye3 = (x: number, y: number) => rect(x, y, 3, 2);
const eyeLine = (x: number, y: number, w = 2) => rect(x, y, w, 1);

/** Waiting — 2×2 eyes, cheeks, gentle smile. */
const WAITING: CeramicFaceMap = {
  eyes: [...eye2(28, 34), ...eye2(58, 34)],
  blink: [...eyeLine(28, 40), ...eyeLine(58, 40)],
  cheeks: [p(16, 52, 0.42), p(76, 52, 0.42)],
  mouth: [p(28, 58), p(64, 58), p(34, 64), p(40, 64), p(46, 64), p(52, 64), p(58, 64)],
};

/** Thinking — eyes up, diamond mouth. */
const THINKING: CeramicFaceMap = {
  eyes: [...eye2(28, 28), ...eye2(58, 28)],
  blink: [...eyeLine(28, 34), ...eyeLine(58, 34)],
  cheeks: [],
  mouth: [p(46, 58), p(40, 64), p(52, 64), p(46, 70)],
};

const SPEAKING_MOUTH_OPEN: CeramicPixel[] = [
  p(40, 58),
  p(46, 58),
  p(52, 58),
  p(34, 64),
  p(58, 64),
  p(40, 70),
  p(46, 70),
  p(52, 70),
];

const SPEAKING_MOUTH_MID: CeramicPixel[] = [
  p(40, 58),
  p(46, 58),
  p(52, 58),
  p(40, 64),
  p(46, 64),
  p(52, 64),
];

const SPEAKING_MOUTH_WIDE: CeramicPixel[] = [
  p(34, 58),
  p(40, 58),
  p(46, 58),
  p(52, 58),
  p(58, 58),
  p(34, 64),
  p(58, 64),
  p(34, 70),
  p(40, 70),
  p(46, 70),
  p(52, 70),
  p(58, 70),
];

/** Speaking — waiting eyes + cheeks + open mouth (+ talk variants). */
const SPEAKING: CeramicFaceMap = {
  eyes: [...eye2(28, 34), ...eye2(58, 34)],
  blink: [...eyeLine(28, 40), ...eyeLine(58, 40)],
  cheeks: [p(16, 52, 0.42), p(76, 52, 0.42)],
  mouth: SPEAKING_MOUTH_OPEN,
  mouthMid: SPEAKING_MOUTH_MID,
  mouthWide: SPEAKING_MOUTH_WIDE,
};

/** Happy — 3×2 eyes, bigger smile. */
const HAPPY: CeramicFaceMap = {
  eyes: [...eye3(22, 28), ...eye3(58, 28)],
  blink: [...eyeLine(22, 34, 3), ...eyeLine(58, 34, 3)],
  cheeks: [p(16, 52, 0.5), p(76, 52, 0.5)],
  mouth: [
    p(22, 58),
    p(70, 58),
    p(28, 64),
    p(64, 64),
    p(34, 70),
    p(40, 70),
    p(46, 70),
    p(52, 70),
    p(58, 70),
  ],
};

/** Surprised — taller eyes + small mouth (send beat only). */
const SURPRISED: CeramicFaceMap = {
  eyes: [...eye2(28, 22), ...eye2(28, 28), ...eye2(58, 22), ...eye2(58, 28)],
  blink: [...eyeLine(28, 34), ...eyeLine(58, 34)],
  cheeks: [],
  mouth: [p(46, 58), p(40, 64), p(52, 64), p(46, 70)],
};

/** Sad — waiting eyes, inverted smile (atlas only; not wired to a mood). */
const SAD: CeramicFaceMap = {
  eyes: [...eye2(28, 34), ...eye2(58, 34)],
  blink: [...eyeLine(28, 40), ...eyeLine(58, 40)],
  cheeks: [p(16, 52, 0.22), p(76, 52, 0.22)],
  mouth: [p(34, 64), p(40, 64), p(46, 64), p(52, 64), p(58, 64), p(28, 70), p(64, 70)],
};

/** Confused — asymmetric eyes, wavy mouth. */
const CONFUSED: CeramicFaceMap = {
  eyes: [...eye2(28, 28), ...eye2(58, 40)],
  blink: [...eyeLine(28, 34), ...eyeLine(58, 46)],
  cheeks: [],
  mouth: [p(34, 64), p(40, 70), p(46, 64), p(52, 70), p(58, 64)],
};

export const CERAMIC_FACES: Record<CeramicFace, CeramicFaceMap> = {
  waiting: WAITING,
  thinking: THINKING,
  speaking: SPEAKING,
  happy: HAPPY,
  surprised: SURPRISED,
  sad: SAD,
  confused: CONFUSED,
};

export type CeramicFaceConfig = {
  face: CeramicFace;
  glow: string;
  rotation: number;
  rays: boolean;
  particles: boolean;
  /** Glow intensity 0..1 (sad/confused dimmer in the pen). */
  intensity: number;
};

export const CERAMIC_FACE_CONFIG: Record<CeramicFace, CeramicFaceConfig> = {
  waiting: {
    face: "waiting",
    glow: "#FF6B4A",
    rotation: -4,
    rays: true,
    particles: false,
    intensity: 1,
  },
  thinking: {
    face: "thinking",
    glow: "#5B8DEF",
    rotation: 0,
    rays: false,
    particles: true,
    intensity: 1,
  },
  speaking: {
    face: "speaking",
    glow: "#059669",
    rotation: 6,
    rays: true,
    particles: false,
    intensity: 1,
  },
  happy: {
    face: "happy",
    glow: "#FFB703",
    rotation: 5,
    rays: true,
    particles: false,
    intensity: 1,
  },
  surprised: {
    face: "surprised",
    glow: "#FF8A45",
    rotation: -8,
    rays: true,
    particles: false,
    intensity: 1,
  },
  sad: {
    face: "sad",
    glow: "#EF476F",
    rotation: -2,
    rays: false,
    particles: false,
    intensity: 0.42,
  },
  confused: {
    face: "confused",
    glow: "#C46B6B",
    rotation: 8,
    rays: false,
    particles: true,
    intensity: 0.72,
  },
};

/** Constant coral LED — never follows the mood glow hue. */
export const ORB_LED = "#E8432D";

/** Map product moods → ceramic faces (surprised/sad are not moods). */
export function moodToCeramicFace(mood: HonzaOrbState): CeramicFace {
  switch (mood) {
    case "idle":
      return "waiting";
    case "thinking":
      return "thinking";
    case "speaking":
      return "speaking";
    case "excited":
      return "happy";
    case "oops":
      return "confused";
    default: {
      const _exhaustive: never = mood;
      return _exhaustive;
    }
  }
}
