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

export type FontId =
  | "share-tech-mono"
  | "geist-sans"
  | "geist-mono"
  | "geist-pixel-square"
  | "geist-pixel-grid"
  | "geist-pixel-circle"
  | "geist-pixel-line"
  | "geist-pixel-triangle";

export type FontMeta = {
  id: FontId;
  label: string;
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
};

export const FONTS: Record<FontId, FontMeta> = {
  "share-tech-mono": {
    id: "share-tech-mono",
    label: "Share Tech Mono",
    cssVar: "--f-share-tech-mono",
    displayOnly: false,
    coversCzech: false,
  },
  "geist-sans": {
    id: "geist-sans",
    label: "Geist Sans",
    cssVar: "--f-geist-sans",
    displayOnly: false,
    coversCzech: true,
  },
  "geist-mono": {
    id: "geist-mono",
    label: "Geist Mono",
    cssVar: "--f-geist-mono",
    displayOnly: false,
    coversCzech: true,
  },
  "geist-pixel-square": {
    id: "geist-pixel-square",
    label: "Geist Pixel Square",
    cssVar: "--f-geist-pixel-square",
    displayOnly: true,
    coversCzech: true,
  },
  "geist-pixel-grid": {
    id: "geist-pixel-grid",
    label: "Geist Pixel Grid",
    cssVar: "--f-geist-pixel-grid",
    displayOnly: true,
    coversCzech: true,
  },
  "geist-pixel-circle": {
    id: "geist-pixel-circle",
    label: "Geist Pixel Circle",
    cssVar: "--f-geist-pixel-circle",
    displayOnly: true,
    coversCzech: true,
  },
  "geist-pixel-line": {
    id: "geist-pixel-line",
    label: "Geist Pixel Line",
    cssVar: "--f-geist-pixel-line",
    displayOnly: true,
    coversCzech: true,
  },
  "geist-pixel-triangle": {
    id: "geist-pixel-triangle",
    label: "Geist Pixel Triangle",
    cssVar: "--f-geist-pixel-triangle",
    displayOnly: true,
    coversCzech: true,
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
