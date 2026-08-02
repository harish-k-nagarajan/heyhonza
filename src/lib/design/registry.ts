/**
 * The design + font registry — the single source of truth for the Design Lab.
 *
 * Two independent axes:
 *   1. `DesignId`  — which visual world renders (Classic, Hmat Metal, Hmat Ceramic).
 *   2. `FontId`    — display face and body face, chosen *separately* so a user can
 *                    (e.g.) try Geist Pixel Square as body copy and watch it fail
 *                    on their own (DESIGN §4.5).
 *
 * Nothing here imports React or `next/font`: the pre-paint inline script, the
 * persisted store, and the Tailwind-driven CSS all validate against these same
 * tables. `classic` is deliberately the fallback everywhere — an unknown or
 * corrupt saved value resolves to Classic, which also renders with no
 * `data-design` attribute at all (see `:root` in globals.css).
 */

export type DesignId = "classic" | "hmat-metal" | "hmat-ceramic";
export type DesignFamily = "classic" | "hmat";
export type HmatVariant = "metal" | "ceramic";

/** Picker grouping in Design Lab (display order). */
export type FontGroup = "pixel" | "mono" | "sans";

export type FontId =
  | "share-tech-mono"
  | "geist-sans"
  | "geist-mono"
  | "geist-pixel-square"
  | "geist-pixel-grid"
  | "geist-pixel-circle"
  | "geist-pixel-line"
  | "geist-pixel-triangle"
  | "doto"
  | "press-start-2p"
  | "syne-mono"
  | "jetbrains-mono"
  | "space-mono"
  | "roboto-mono"
  | "ibm-plex-sans"
  | "dm-sans"
  | "space-grotesk"
  | "alan-sans";

export type FontMeta = {
  id: FontId;
  label: string;
  group: FontGroup;
  /**
   * The CSS custom property that resolves to this face's full font stack. Both
   * the pre-paint script and the runtime store set `--font-display` /
   * `--font-body` to `var(<cssVar>)`. The `--f-*` vars themselves are declared
   * once in globals.css, chaining into the `next/font` variables.
   */
  cssVar: `--f-${string}`;
  /**
   * A face built for headings/chrome/numerals, not for reading Czech prose. The
   * Lab warns when one is chosen for body copy (DESIGN §4.5).
   */
  displayOnly: boolean;
  /** Covers the full Czech diacritic set (ě š č ř ž ů ď ť ň). Classic's mono does not — that's F0. */
  coversCzech: boolean;
  /** Weights available for the Lab weight-preview row (400-only faces omit or use [400]). */
  weights: readonly number[];
};

export const FONT_GROUPS: { id: FontGroup; label: string }[] = [
  { id: "pixel", label: "Dot-matrix & pixel" },
  { id: "mono", label: "Monospace" },
  { id: "sans", label: "Sans-serif" },
];

export const FONTS: Record<FontId, FontMeta> = {
  "share-tech-mono": {
    id: "share-tech-mono",
    label: "Share Tech Mono",
    group: "mono",
    cssVar: "--f-share-tech-mono",
    displayOnly: false,
    coversCzech: false,
    weights: [400],
  },
  "geist-sans": {
    id: "geist-sans",
    label: "Geist Sans",
    group: "sans",
    cssVar: "--f-geist-sans",
    displayOnly: false,
    coversCzech: true,
    weights: [400, 500, 600, 700],
  },
  "geist-mono": {
    id: "geist-mono",
    label: "Geist Mono",
    group: "mono",
    cssVar: "--f-geist-mono",
    displayOnly: false,
    coversCzech: true,
    weights: [400, 500, 600, 700],
  },
  "geist-pixel-square": {
    id: "geist-pixel-square",
    label: "Geist Pixel Square",
    group: "pixel",
    cssVar: "--f-geist-pixel-square",
    displayOnly: true,
    coversCzech: true,
    weights: [400],
  },
  "geist-pixel-grid": {
    id: "geist-pixel-grid",
    label: "Geist Pixel Grid",
    group: "pixel",
    cssVar: "--f-geist-pixel-grid",
    displayOnly: true,
    coversCzech: true,
    weights: [400],
  },
  "geist-pixel-circle": {
    id: "geist-pixel-circle",
    label: "Geist Pixel Circle",
    group: "pixel",
    cssVar: "--f-geist-pixel-circle",
    displayOnly: true,
    coversCzech: true,
    weights: [400],
  },
  "geist-pixel-line": {
    id: "geist-pixel-line",
    label: "Geist Pixel Line",
    group: "pixel",
    cssVar: "--f-geist-pixel-line",
    displayOnly: true,
    coversCzech: true,
    weights: [400],
  },
  "geist-pixel-triangle": {
    id: "geist-pixel-triangle",
    label: "Geist Pixel Triangle",
    group: "pixel",
    cssVar: "--f-geist-pixel-triangle",
    displayOnly: true,
    coversCzech: true,
    weights: [400],
  },
  doto: {
    id: "doto",
    label: "Doto",
    group: "pixel",
    cssVar: "--f-doto",
    displayOnly: true,
    coversCzech: true,
    weights: [400, 500, 600, 700],
  },
  "press-start-2p": {
    id: "press-start-2p",
    label: "Press Start 2P",
    group: "pixel",
    cssVar: "--f-press-start-2p",
    displayOnly: true,
    coversCzech: false,
    weights: [400],
  },
  "syne-mono": {
    id: "syne-mono",
    label: "Syne Mono",
    group: "mono",
    cssVar: "--f-syne-mono",
    displayOnly: true,
    coversCzech: true,
    weights: [400],
  },
  "jetbrains-mono": {
    id: "jetbrains-mono",
    label: "JetBrains Mono",
    group: "mono",
    cssVar: "--f-jetbrains-mono",
    displayOnly: false,
    coversCzech: true,
    weights: [400, 500, 600, 700],
  },
  "space-mono": {
    id: "space-mono",
    label: "Space Mono",
    group: "mono",
    cssVar: "--f-space-mono",
    displayOnly: false,
    coversCzech: true,
    weights: [400, 700],
  },
  "roboto-mono": {
    id: "roboto-mono",
    label: "Roboto Mono",
    group: "mono",
    cssVar: "--f-roboto-mono",
    displayOnly: false,
    coversCzech: true,
    weights: [400, 500, 600, 700],
  },
  "ibm-plex-sans": {
    id: "ibm-plex-sans",
    label: "IBM Plex Sans",
    group: "sans",
    cssVar: "--f-ibm-plex-sans",
    displayOnly: false,
    coversCzech: true,
    weights: [400, 500, 600, 700],
  },
  "dm-sans": {
    id: "dm-sans",
    label: "DM Sans",
    group: "sans",
    cssVar: "--f-dm-sans",
    displayOnly: false,
    coversCzech: true,
    weights: [400, 500, 600, 700],
  },
  "space-grotesk": {
    id: "space-grotesk",
    label: "Space Grotesk",
    group: "sans",
    cssVar: "--f-space-grotesk",
    displayOnly: false,
    coversCzech: true,
    weights: [400, 500, 600, 700],
  },
  "alan-sans": {
    id: "alan-sans",
    label: "Alan Sans",
    group: "sans",
    cssVar: "--f-alan-sans",
    displayOnly: false,
    coversCzech: false,
    weights: [300, 400, 500, 600, 700],
  },
};

export type DesignMeta = {
  id: DesignId;
  label: string;
  /** One-line description shown on the Lab swatch. Real Czech, full diacritics. */
  tagline: string;
  family: DesignFamily;
  /** Only present on Hmat designs; selects the surface token block. */
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

/** Fonts in a group, stable label order within the group. */
export function fontsInGroup(group: FontGroup): FontId[] {
  return FONT_IDS.filter((id) => FONTS[id].group === group);
}

export const DEFAULT_DESIGN: DesignId = "hmat-metal";

export function isDesignId(v: unknown): v is DesignId {
  return typeof v === "string" && v in DESIGNS;
}

export function isFontId(v: unknown): v is FontId {
  return typeof v === "string" && v in FONTS;
}

/** The `var(--f-…)` expression a resolved display/body font points `<html>` at. */
export function fontFamilyVar(id: FontId): string {
  return `var(${FONTS[id].cssVar})`;
}

/** CSS font-weight value for a weight preview chip. */
export function weightLabel(w: number): string {
  if (w <= 300) return "Light";
  if (w === 400) return "Regular";
  if (w === 500) return "Medium";
  if (w === 600) return "Semi";
  if (w >= 700) return "Bold";
  return String(w);
}
