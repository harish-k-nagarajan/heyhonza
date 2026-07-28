/**
 * The type scale (system kit, P4) — one set of type roles, built once and used
 * by every Hmat surface so headings, labels, captions and body copy stay
 * consistent across Home / Chat / Call / Settings and both material variants.
 *
 * Two axes, from the token contract (P1):
 *   `font-display` → the pixel display face (Geist Pixel Square on Hmat)
 *   `font-sans`    → the body face (Noto Sans on Hmat) — full Czech diacritics
 *
 * These are className strings, not components: drop them onto any element. Roles
 * carrying Czech prose deliberately use `font-sans` (never a display face), so
 * ě š č ř ž ů ď ť ň never fall back mid-word (the F0 fix).
 */
export const TYPE = {
  /** Tiny monospaced/pixel eyebrow over a section. */
  kicker: "font-display text-[9px] uppercase tracking-[0.2em]",
  /** `//`-style section label (chrome). */
  label: "font-display text-[10px] uppercase tracking-[0.16em]",
  /** Numerals + status chips (call timer, badges). */
  meta: "font-display text-[11px] tracking-[0.14em]",
  /** Screen title / hero display. */
  display: "font-display text-2xl tracking-[-0.01em]",
  /** Honza's Czech — body copy and corrections. Body face, always. */
  body: "font-sans text-[15px] leading-relaxed",
  /** Smaller Czech body (bubbles, captions). Body face. */
  bodySm: "font-sans text-sm leading-relaxed",
  /** Muted helper text. Body face. */
  helper: "font-sans text-xs leading-relaxed text-muted-foreground",
} as const;

export type TypeRole = keyof typeof TYPE;
