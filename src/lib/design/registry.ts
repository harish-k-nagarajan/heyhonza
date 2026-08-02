/**
 * Shipped design tokens — Hmat Metal + Doto labels + Space Grotesk body.
 * The Design Lab picker was removed once this pairing was finalized (2026-08).
 */

export type DesignId = "hmat-metal";
export type DesignFamily = "hmat";

export type FontId = "doto" | "space-grotesk";

export const SHIPPED_DESIGN = "hmat-metal" as const satisfies DesignId;
export const SHIPPED_DISPLAY_FONT = "doto" as const satisfies FontId;
export const SHIPPED_BODY_FONT = "space-grotesk" as const satisfies FontId;

/** @deprecated Use SHIPPED_DESIGN — single shipped design. */
export const DEFAULT_DESIGN = SHIPPED_DESIGN;

export type FontMeta = {
  id: FontId;
  label: string;
  cssVar: `--f-${string}`;
  displayWeight?: number;
  displayWeightUi?: number;
};

export const FONTS: Record<FontId, FontMeta> = {
  doto: {
    id: "doto",
    label: "Doto",
    cssVar: "--f-doto",
    displayWeight: 500,
    displayWeightUi: 700,
  },
  "space-grotesk": {
    id: "space-grotesk",
    label: "Space Grotesk",
    cssVar: "--f-space-grotesk",
  },
};

export type DesignMeta = {
  id: DesignId;
  label: string;
  family: DesignFamily;
  defaultDisplayFont: FontId;
  defaultBodyFont: FontId;
};

export const DESIGNS: Record<DesignId, DesignMeta> = {
  "hmat-metal": {
    id: "hmat-metal",
    label: "Hmat Metal",
    family: "hmat",
    defaultDisplayFont: SHIPPED_DISPLAY_FONT,
    defaultBodyFont: SHIPPED_BODY_FONT,
  },
};

export const DESIGN_IDS = Object.keys(DESIGNS) as DesignId[];

export function isDesignId(v: unknown): v is DesignId {
  return v === SHIPPED_DESIGN;
}

export function fontFamilyVar(id: FontId): string {
  return `var(${FONTS[id].cssVar})`;
}

export function displayWeightVars(displayFont: FontId = SHIPPED_DISPLAY_FONT): {
  displayWeight: number;
  displayWeightUi: number;
} {
  const meta = FONTS[displayFont];
  return {
    displayWeight: meta.displayWeight ?? 400,
    displayWeightUi: meta.displayWeightUi ?? meta.displayWeight ?? 400,
  };
}
