import {
  DEFAULT_DESIGN,
  fontFamilyVar,
  isDesignId,
  isFontId,
} from "./registry";
import type { DesignId, FontId } from "./registry";

/**
 * Apply a resolved design + font pair to `<html>`. The single runtime that both
 * `DesignRoot` (React) and, in inlined form, the pre-paint `<head>` script use —
 * keep the two in lockstep.
 *
 * Classic is expressed as the *absence* of a `data-design` attribute (`:root`
 * holds Classic in globals.css), so Classic renders on the server, with JS off,
 * and before any script runs. Non-Classic designs stamp the attribute.
 */
export function applyDesignToRoot(
  design: DesignId,
  displayFont: FontId,
  bodyFont: FontId,
  root: HTMLElement = document.documentElement,
) {
  const d = isDesignId(design) ? design : DEFAULT_DESIGN;
  const df = isFontId(displayFont) ? displayFont : "share-tech-mono";
  const bf = isFontId(bodyFont) ? bodyFont : "share-tech-mono";

  if (d === "classic") root.removeAttribute("data-design");
  else root.setAttribute("data-design", d);

  root.style.setProperty("--font-display", fontFamilyVar(df));
  root.style.setProperty("--font-body", fontFamilyVar(bf));
}
