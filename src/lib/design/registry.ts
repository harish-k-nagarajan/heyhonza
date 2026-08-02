/**
 * The design + font registry — the single source of truth for the Design Lab.
 *
 * Two independent axes:
 *   1. `DesignId`  — which visual world renders (Classic, Hmat Metal, Hmat Ceramic).
 *   2. `FontId`    — display face and body face (short labels vs long Czech text).
 *
 * The Lab exposes a small curated set + ready-made pairings. Legacy font ids from
 * earlier Lab builds are remapped on load via `normalizeFontId`.
 */

export type DesignId = "classic" | "hmat-metal" | "hmat-ceramic";
export type DesignFamily = "classic" | "hmat";
export type HmatVariant = "metal" | "ceramic";

export type FontId =
  | "share-tech-mono"
  | "geist-sans"
  | "geist-pixel-square"
  | "doto"
  | "jetbrains-mono"
  | "ibm-plex-sans";

export type FontMeta = {
  id: FontId;
  /** Short name in the Lab picker. */
  label: string;
  /** One line: where this font shows up in the app. */
  roleHint: string;
  cssVar: `--f-${string}`;
  /** Pixel / dot faces — not for long Czech paragraphs. */
  displayOnly: boolean;
  coversCzech: boolean;
};

export const FONTS: Record<FontId, FontMeta> = {
  "share-tech-mono": {
    id: "share-tech-mono",
    label: "Share Tech Mono",
    roleHint: "Classic dot-matrix mono",
    cssVar: "--f-share-tech-mono",
    displayOnly: false,
    coversCzech: false,
  },
  "geist-sans": {
    id: "geist-sans",
    label: "Geist Sans",
    roleHint: "Easy to read — best for Czech chat",
    cssVar: "--f-geist-sans",
    displayOnly: false,
    coversCzech: true,
  },
  "geist-pixel-square": {
    id: "geist-pixel-square",
    label: "Geist Pixel",
    roleHint: "Matches Honza's dot face",
    cssVar: "--f-geist-pixel-square",
    displayOnly: true,
    coversCzech: true,
  },
  doto: {
    id: "doto",
    label: "Doto",
    roleHint: "Pure dot-matrix display",
    cssVar: "--f-doto",
    displayOnly: true,
    coversCzech: true,
  },
  "jetbrains-mono": {
    id: "jetbrains-mono",
    label: "JetBrains Mono",
    roleHint: "Terminal mono — full Czech",
    cssVar: "--f-jetbrains-mono",
    displayOnly: false,
    coversCzech: true,
  },
  "ibm-plex-sans": {
    id: "ibm-plex-sans",
    label: "IBM Plex Sans",
    roleHint: "Clean sans — full Czech",
    cssVar: "--f-ibm-plex-sans",
    displayOnly: false,
    coversCzech: true,
  },
};

/** Curated faces for the optional “custom” row in the Lab. */
export const LAB_DISPLAY_FONTS: FontId[] = [
  "geist-pixel-square",
  "share-tech-mono",
  "doto",
];

export const LAB_BODY_FONTS: FontId[] = ["geist-sans", "jetbrains-mono", "ibm-plex-sans"];

export type FontPairingPresetId =
  | "hmat-default"
  | "classic"
  | "dot-matrix"
  | "soft-readable";

export type FontPairingPreset = {
  id: FontPairingPresetId;
  label: string;
  description: string;
  displayFont: FontId;
  bodyFont: FontId;
  recommended?: boolean;
};

/** Ready-made pairings — what most people should pick. */
export const FONT_PAIRING_PRESETS: FontPairingPreset[] = [
  {
    id: "hmat-default",
    label: "Hmat (recommended)",
    description: "Pixel labels + easy Czech reading. Default for Metal & Ceramic.",
    displayFont: "geist-pixel-square",
    bodyFont: "geist-sans",
    recommended: true,
  },
  {
    id: "classic",
    label: "Classic Honza",
    description: "One mono font everywhere — the original shipped look.",
    displayFont: "share-tech-mono",
    bodyFont: "share-tech-mono",
  },
  {
    id: "dot-matrix",
    label: "Full dot-matrix",
    description: "Dot labels + mono Czech text. Very hardware / Nothing-like.",
    displayFont: "doto",
    bodyFont: "jetbrains-mono",
  },
  {
    id: "soft-readable",
    label: "Soft & clear",
    description: "Pixel labels + calm sans body. Gentle on long reading.",
    displayFont: "geist-pixel-square",
    bodyFont: "ibm-plex-sans",
  },
];

export type DesignMeta = {
  id: DesignId;
  label: string;
  tagline: string;
  family: DesignFamily;
  variant?: HmatVariant;
  defaultDisplayFont: FontId;
  defaultBodyFont: FontId;
};

export const DESIGNS: Record<DesignId, DesignMeta> = {
  classic: {
    id: "classic",
    label: "Classic",
    tagline: "Původní Honza — dot-matrix a Share Tech Mono.",
    family: "classic",
    defaultDisplayFont: "share-tech-mono",
    defaultBodyFont: "share-tech-mono",
  },
  "hmat-metal": {
    id: "hmat-metal",
    label: "Hmat Metal",
    tagline: "Kartáčovaný krémový kov s jemným zrnem.",
    family: "hmat",
    variant: "metal",
    defaultDisplayFont: "geist-pixel-square",
    defaultBodyFont: "geist-sans",
  },
  "hmat-ceramic": {
    id: "hmat-ceramic",
    label: "Hmat Ceramic",
    tagline: "Teplá matná keramika — hladká, bez zrna.",
    family: "hmat",
    variant: "ceramic",
    defaultDisplayFont: "geist-pixel-square",
    defaultBodyFont: "geist-sans",
  },
};

export const DESIGN_IDS = Object.keys(DESIGNS) as DesignId[];
export const FONT_IDS = Object.keys(FONTS) as FontId[];

export const DEFAULT_DESIGN: DesignId = "hmat-metal";

/** Maps retired Lab font ids (Phase 1 expansion) to a supported face. */
const LEGACY_FONT_MAP: Record<string, FontId> = {
  "geist-mono": "jetbrains-mono",
  "geist-pixel-grid": "geist-pixel-square",
  "geist-pixel-circle": "geist-pixel-square",
  "geist-pixel-line": "geist-pixel-square",
  "geist-pixel-triangle": "geist-pixel-square",
  "press-start-2p": "doto",
  "syne-mono": "share-tech-mono",
  "space-mono": "jetbrains-mono",
  "roboto-mono": "jetbrains-mono",
  "dm-sans": "geist-sans",
  "space-grotesk": "geist-sans",
  "alan-sans": "geist-sans",
};

export function normalizeFontId(value: unknown, fallback: FontId): FontId {
  if (typeof value !== "string") return fallback;
  if (value in FONTS) return value as FontId;
  return LEGACY_FONT_MAP[value] ?? fallback;
}

export function isDesignId(v: unknown): v is DesignId {
  return typeof v === "string" && v in DESIGNS;
}

export function isFontId(v: unknown): v is FontId {
  return typeof v === "string" && v in FONTS;
}

export function fontFamilyVar(id: FontId): string {
  return `var(${FONTS[id].cssVar})`;
}

export function activeFontPreset(
  displayFont: FontId,
  bodyFont: FontId,
): FontPairingPresetId | null {
  const match = FONT_PAIRING_PRESETS.find(
    (p) => p.displayFont === displayFont && p.bodyFont === bodyFont,
  );
  return match?.id ?? null;
}
