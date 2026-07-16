import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_DESIGN, DESIGNS, isDesignId, isFontId } from "@/lib/design/registry";
import type { DesignId, FontId } from "@/lib/design/registry";

/**
 * The Design Lab selection — which design renders and which two faces it uses.
 * Persisted to `localStorage` under `honza-design`; the pre-paint script in
 * `<head>` reads this same blob to paint the correct design before React runs
 * (no flash), and `DesignRoot` keeps the live DOM in sync after hydration.
 *
 * Fonts are a separate axis, but switching *design* resets both faces to that
 * design's defaults — that's what makes "choose Classic → the shipped app,
 * exactly" true (Classic's default is Share Tech Mono, F0 bug and all). After a
 * switch the user can still override either face independently, or reset.
 */
export const DESIGN_STORAGE_KEY = "honza-design";

export type DesignState = {
  design: DesignId;
  displayFont: FontId;
  bodyFont: FontId;
  setDesign: (design: DesignId) => void;
  setDisplayFont: (font: FontId) => void;
  setBodyFont: (font: FontId) => void;
  /** Re-apply the current design's default display + body faces. */
  resetFonts: () => void;
};

function defaultsFor(design: DesignId) {
  const meta = DESIGNS[design];
  return { displayFont: meta.defaultDisplayFont, bodyFont: meta.defaultBodyFont };
}

const initial = {
  design: DEFAULT_DESIGN,
  ...defaultsFor(DEFAULT_DESIGN),
};

export const useDesignStore = create<DesignState>()(
  persist(
    (set, get) => ({
      ...initial,
      setDesign: (design) => {
        if (!isDesignId(design)) return;
        set({ design, ...defaultsFor(design) });
      },
      setDisplayFont: (font) => {
        if (isFontId(font)) set({ displayFont: font });
      },
      setBodyFont: (font) => {
        if (isFontId(font)) set({ bodyFont: font });
      },
      resetFonts: () => set(defaultsFor(get().design)),
    }),
    {
      name: DESIGN_STORAGE_KEY,
      // Guard against a hand-edited / stale blob: coerce anything invalid back
      // to a coherent Classic state rather than trusting persisted values.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<DesignState>;
        const design = isDesignId(p.design) ? p.design : DEFAULT_DESIGN;
        return {
          ...current,
          design,
          displayFont: isFontId(p.displayFont) ? p.displayFont : defaultsFor(design).displayFont,
          bodyFont: isFontId(p.bodyFont) ? p.bodyFont : defaultsFor(design).bodyFont,
        };
      },
    },
  ),
);
