/**
 * Honza's mood palette — the single source of truth for the state → color map
 * described in DESIGN.md ("Colors (emotional states)").
 *
 * Lives in its own module (not inside the `HonzaOrb` component) so both the
 * character component and the app-wide mood store can import it without one
 * pulling the other's React tree into a bundle. DESIGN.md's implementation
 * notes explicitly allow splitting this into "a tiny honza/theme module."
 */

/** Visual / mood states for the dot-matrix face and screen tinting. */
export type HonzaOrbState = "idle" | "thinking" | "speaking" | "oops" | "excited";

export const HONZA_STATE_COLORS: Record<
  HonzaOrbState,
  { background: string; accent: string }
> = {
  idle: { background: "#FFF4EE", accent: "#E8432D" },
  thinking: { background: "#EEF2FF", accent: "#3A7BD5" },
  speaking: { background: "#EEFFEE", accent: "#2E7D32" },
  oops: { background: "#FFF0F5", accent: "#C2185B" },
  excited: { background: "#FFF4EE", accent: "#E8432D" },
};

/** The canonical cream canvas behind everything (DESIGN.md "Background"). */
export const CREAM_CANVAS = "#F5F2EE";
