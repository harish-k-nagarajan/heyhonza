import { SHIPPED_BODY_FONT, SHIPPED_DESIGN, SHIPPED_DISPLAY_FONT } from "@/lib/design/registry";

/**
 * Fixed shipped design — no persistence, no Lab switching.
 */
export type DesignState = {
  design: typeof SHIPPED_DESIGN;
  displayFont: typeof SHIPPED_DISPLAY_FONT;
  bodyFont: typeof SHIPPED_BODY_FONT;
};

const SHIPPED_STATE: DesignState = {
  design: SHIPPED_DESIGN,
  displayFont: SHIPPED_DISPLAY_FONT,
  bodyFont: SHIPPED_BODY_FONT,
};

/** Read-only access to the shipped design + fonts. */
export function useDesignStore<T>(selector: (state: DesignState) => T): T {
  return selector(SHIPPED_STATE);
}
