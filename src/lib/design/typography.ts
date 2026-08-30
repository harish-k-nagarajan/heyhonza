/**
 * The type scale — one set of roles for the shipped look (Hmat Metal).
 *
 * Fonts (locked — see `design update/SHIPPED_DESIGN.md`):
 *   `font-display` → **Doto** (short labels / buttons)
 *   `font-sans`    → **Inter** (Czech body — full diacritics)
 *
 * Weight rules:
 *   **Display (Doto):** hierarchy via **size + tracking**, not Tailwind weight
 *   utilities. Labels/kickers use `--font-display-weight` (500). Buttons and
 *   mat-key CTAs use `display-ui-weight` → `--font-display-weight-ui` (700).
 *   (Named `display-ui-weight`, not `font-display-ui`, so tailwind-merge does
 *   not treat it as a font-family utility and strip `font-display`.)
 *   **Body (Inter):** `font-medium` / `font-semibold` are allowed where
 *   hierarchy needs weight (unlike Classic's mono, which synthesized faux bold).
 *   Sans headings use `tracking-tight`; body copy uses `tracking-normal`.
 *
 * These are className strings, not components: drop them onto any element.
 * Roles carrying Czech prose use `font-sans` (never a display face), so
 * ě š č ř ž ů ď ť ň never fall back mid-word.
 */
export const TYPE = {
  /** Tiny display eyebrow (mood badges, overlines). */
  kicker: "font-display text-[9px] uppercase tracking-[0.2em]",
  /** Section / chrome labels (`// Nastavení`, form headings). */
  label: "font-display text-[10px] uppercase tracking-[0.16em]",
  /** Numerals + status chips (call timer, section nums, loading). */
  meta: "font-display text-[11px] tracking-[0.14em]",
  /** Screen / card title — Doto; hierarchy via size + tracking. */
  title: "font-display text-lg tracking-[0.04em]",
  /**
   * Supporting line under a title — Inter, muted, standard tracking.
   * Use `font-medium` on the element when the lead needs extra weight.
   */
  subtitle: "font-sans text-sm leading-relaxed tracking-normal text-muted-foreground",
  /** Sans heading / large title — Inter, tight tracking. Display face stays Doto. */
  heading: "font-sans text-lg font-semibold leading-tight tracking-tight",
  /** Hero / brand display (in-app). */
  display: "font-display text-2xl tracking-[-0.01em]",
  /** Marketing hero brand (landing). */
  displayLg:
    "font-display text-[28px] leading-tight tracking-[0.04em] md:text-[34px]",
  /** Honza's Czech — body copy and corrections. Body face, always. */
  body: "font-sans text-[15px] leading-relaxed tracking-normal",
  /** Smaller Czech body (bubbles, captions). Body face. */
  bodySm: "font-sans text-sm leading-relaxed tracking-normal",
  /** Buttons and mat-keys — Doto 700 via `--font-display-weight-ui`. */
  button: "font-display display-ui-weight text-xs uppercase tracking-[0.18em]",
  /** Muted helper text. Body face. */
  helper: "font-sans text-xs leading-relaxed tracking-normal text-muted-foreground",
} as const;

export type TypeRole = keyof typeof TYPE;
