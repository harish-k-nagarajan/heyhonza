import {
  displayWeightVars,
  fontFamilyVar,
  isDesignId,
  SHIPPED_BODY_FONT,
  SHIPPED_DISPLAY_FONT,
} from "./registry";
import type { DesignId, FontId } from "./registry";

export function applyDesignToRoot(
  design: DesignId,
  displayFont: FontId = SHIPPED_DISPLAY_FONT,
  bodyFont: FontId = SHIPPED_BODY_FONT,
  root: HTMLElement = document.documentElement,
) {
  if (!isDesignId(design)) return;

  root.setAttribute("data-design", design);
  root.setAttribute("data-display-font", displayFont);
  root.setAttribute("data-body-font", bodyFont);

  const weights = displayWeightVars(displayFont);
  root.style.setProperty("--font-display", fontFamilyVar(displayFont));
  root.style.setProperty("--font-body", fontFamilyVar(bodyFont));
  root.style.setProperty("--font-display-weight", String(weights.displayWeight));
  root.style.setProperty("--font-display-weight-ui", String(weights.displayWeightUi));
}
