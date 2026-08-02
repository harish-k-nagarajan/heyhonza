/**
 * The design + font registry — the single source of truth for the Design Lab.
 */

export type DesignId = "classic" | "hmat-metal" | "hmat-ceramic";
export type DesignFamily = "classic" | "hmat";
export type HmatVariant = "metal" | "ceramic";

export type FontBodyGroup = "easy" | "mono" | "suggested";

export type FontId =
  | "share-tech-mono"
  | "geist-sans"
  | "geist-mono"
  | "geist-pixel-square"
  | "doto"
  | "jetbrains-mono"
  | "ibm-plex-sans"
  | "alan-sans"
  | "dm-sans"
  | "space-grotesk"
  | "space-mono";

export type FontMeta = {
  id: FontId;
  label: string;
  roleHint: string;
  cssVar: `--f-${string}`;
  displayOnly: boolean;
  coversCzech: boolean;
  /** Shown in Lab when this was a user-suggested face. */
  userPick?: boolean;
  /** Body-font subgroup for the advanced picker. */
  bodyGroup?: FontBodyGroup;
  /** Default font-weight for UI chrome when this is the display face. */
  displayWeight?: number;
  /** Heavier weight for buttons / mat-keys when this is the display face. */
  displayWeightUi?: number;
};

export const FONTS: Record<FontId, FontMeta> = {
  "share-tech-mono": {
    id: "share-tech-mono",
    label: "Share Tech Mono",
    roleHint: "Classic dot-matrix mono",
    cssVar: "--f-share-tech-mono",
    displayOnly: false,
    coversCzech: false,
    displayWeight: 400,
    displayWeightUi: 400,
  },
  "geist-sans": {
    id: "geist-sans",
    label: "Geist Sans",
    roleHint: "Soft and easy — default for Czech chat",
    cssVar: "--f-geist-sans",
    displayOnly: false,
    coversCzech: true,
    bodyGroup: "easy",
  },
  "geist-mono": {
    id: "geist-mono",
    label: "Geist Mono",
    roleHint: "Clean mono — full Czech",
    cssVar: "--f-geist-mono",
    displayOnly: false,
    coversCzech: true,
    bodyGroup: "mono",
  },
  "geist-pixel-square": {
    id: "geist-pixel-square",
    label: "Geist Pixel",
    roleHint: "Matches Honza's dot face",
    cssVar: "--f-geist-pixel-square",
    displayOnly: true,
    coversCzech: true,
    displayWeight: 400,
    displayWeightUi: 400,
  },
  doto: {
    id: "doto",
    label: "Doto",
    roleHint: "Pure dot-matrix — boldest on buttons",
    cssVar: "--f-doto",
    displayOnly: true,
    coversCzech: true,
    displayWeight: 500,
    displayWeightUi: 700,
  },
  "jetbrains-mono": {
    id: "jetbrains-mono",
    label: "JetBrains Mono",
    roleHint: "Terminal mono — full Czech",
    cssVar: "--f-jetbrains-mono",
    displayOnly: false,
    coversCzech: true,
    bodyGroup: "mono",
  },
  "ibm-plex-sans": {
    id: "ibm-plex-sans",
    label: "IBM Plex Sans",
    roleHint: "Neutral sans — full Czech",
    cssVar: "--f-ibm-plex-sans",
    displayOnly: false,
    coversCzech: true,
    bodyGroup: "easy",
  },
  "alan-sans": {
    id: "alan-sans",
    label: "Alan Sans",
    roleHint: "Playful modern sans — you suggested this",
    cssVar: "--f-alan-sans",
    displayOnly: false,
    coversCzech: false,
    userPick: true,
    bodyGroup: "suggested",
  },
  "dm-sans": {
    id: "dm-sans",
    label: "DM Sans",
    roleHint: "Rounded friendly sans — full Czech",
    cssVar: "--f-dm-sans",
    displayOnly: false,
    coversCzech: true,
    bodyGroup: "easy",
  },
  "space-grotesk": {
    id: "space-grotesk",
    label: "Space Grotesk",
    roleHint: "Bold tech sans — closest to Freedom Forever vibe",
    cssVar: "--f-space-grotesk",
    displayOnly: false,
    coversCzech: true,
    bodyGroup: "suggested",
  },
  "space-mono": {
    id: "space-mono",
    label: "Space Mono",
    roleHint: "Retro mono — Nothing / sci-fi feel",
    cssVar: "--f-space-mono",
    displayOnly: false,
    coversCzech: true,
    bodyGroup: "mono",
  },
};

export const LAB_DISPLAY_FONTS: FontId[] = [
  "doto",
  "geist-pixel-square",
  "share-tech-mono",
];

export const LAB_BODY_GROUPS: { id: FontBodyGroup; label: string }[] = [
  { id: "easy", label: "Easy reading" },
  { id: "mono", label: "Monospace" },
  { id: "suggested", label: "From your list" },
];

export function bodyFontsInGroup(group: FontBodyGroup): FontId[] {
  return (Object.keys(FONTS) as FontId[]).filter(
    (id) => !FONTS[id].displayOnly && FONTS[id].bodyGroup === group,
  );
}

export type FontPairingPresetId =
  | "hmat-default"
  | "doto-geist"
  | "doto-alan"
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

export const FONT_PAIRING_PRESETS: FontPairingPreset[] = [
  {
    id: "hmat-default",
    label: "Hmat (recommended)",
    description: "Geist Pixel labels + Geist Sans for Czech chat.",
    displayFont: "geist-pixel-square",
    bodyFont: "geist-sans",
    recommended: true,
  },
  {
    id: "doto-geist",
    label: "Doto labels + Geist Sans",
    description: "Your dot-matrix look on buttons; soft Czech reading.",
    displayFont: "doto",
    bodyFont: "geist-sans",
  },
  {
    id: "doto-alan",
    label: "Doto labels + Alan Sans",
    description: "Dot labels + Alan Sans body — your font combo.",
    displayFont: "doto",
    bodyFont: "alan-sans",
  },
  {
    id: "classic",
    label: "Classic Honza",
    description: "Share Tech Mono everywhere.",
    displayFont: "share-tech-mono",
    bodyFont: "share-tech-mono",
  },
  {
    id: "dot-matrix",
    label: "Full dot-matrix",
    description: "Doto + JetBrains Mono — hardware / Nothing-like.",
    displayFont: "doto",
    bodyFont: "jetbrains-mono",
  },
  {
    id: "soft-readable",
    label: "Doto + IBM Plex",
    description: "Dot labels + calm IBM Plex for long reading.",
    displayFont: "doto",
    bodyFont: "ibm-plex-sans",
  },
];

/** Fonts you named that need a commercial license before we can ship them. */
export const PENDING_USER_FONTS = [
  {
    name: "Freedom Forever",
    note: "Commercial font — Space Grotesk is the closest built-in stand-in.",
  },
  {
    name: "Monolito / Monólita",
    note: "Display typeface — Doto covers the dot-matrix role today.",
  },
  {
    name: "Onder",
    note: "Decorative display — not suitable for Czech paragraphs; needs a license file.",
  },
] as const;

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

const LEGACY_FONT_MAP: Record<string, FontId> = {
  "geist-pixel-grid": "geist-pixel-square",
  "geist-pixel-circle": "geist-pixel-square",
  "geist-pixel-line": "geist-pixel-square",
  "geist-pixel-triangle": "geist-pixel-square",
  "press-start-2p": "doto",
  "syne-mono": "share-tech-mono",
  "roboto-mono": "jetbrains-mono",
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

export function displayWeightVars(displayFont: FontId): {
  displayWeight: number;
  displayWeightUi: number;
} {
  const meta = FONTS[displayFont];
  return {
    displayWeight: meta.displayWeight ?? 400,
    displayWeightUi: meta.displayWeightUi ?? meta.displayWeight ?? 400,
  };
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
