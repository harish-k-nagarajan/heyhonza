# Honza Design Elevation Plan

**Branch:** `cursor/design-elevation-1034` off `main`

---

## Executive summary

Honza already has strong foundations: a **Design Lab** with 8 swappable fonts (`src/lib/design/registry.ts`), a partial **TYPE scale** (`src/lib/design/typography.ts`), Hmat **mat-key** tactile depth (`src/app/globals.css`), and design-lab prototypes for **live waveforms** (`design-lab/round2-premium-gallery.html`). The gaps are:

1. **Font options feel limited** and several user-requested faces are commercial/unverified for Czech.
2. **Typography hierarchy is inconsistent** — `TYPE` is used in one file; Classic uses ad-hoc sizes; `font-medium` is applied where fonts only ship weight 400.
3. **Buttons are split across two systems** — flat Classic `Button.tsx` vs raw `mat-key` Hmat buttons with no shared API.
4. **No live orb backdrop** — speaking/thinking states lack the Velu-style animated dot field behind the face.

This plan tackles all four in dependency order: **fonts + typography system → buttons → live dots → polish audit**.

---

## Phased delivery

| Phase | Scope | Status |
|-------|-------|--------|
| **0** | Branch, plan doc, ui-ux-pro-max skill, audit checklist | Done |
| **1** | Font expansion + Design Lab UX (grouped picker, weight preview, Czech badge) | Done |
| **2** | Typography system (`TYPE` roles, migration) | Pending |
| **3** | Button unification (depth, focus rings, shared API) | Pending |
| **4** | Live orb dot/waveform backdrop | Pending |
| **5** | Polish audit closure | Pending |

---

## Part 1: Full design audit

### What works well (keep)

| Area | Evidence | Why it works |
|------|----------|--------------|
| Character-led layout | `DESIGN.md` + recess orb on every screen | Honza *is* the app |
| Mood expression engine | `src/lib/mood/expression.ts` | `--accent`, `--energy`, `--bg` drive coherent state tints |
| Hmat tactile material | `.mat-key`, `.mat-recess`, `.fdock` in `globals.css` | Real depth on send/call/dock |
| Design Lab font axis | `DesignLab.tsx` | Pre-paint script prevents FOUT; Czech specimen catches F0 bugs |
| Orb crossfade + reduced motion | `HonzaOrb.tsx` | 200ms expression swap; `motion-safe:` guards |

### Critical issues (fix)

**Typography (high):** `TYPE` used in HmatChat only; tracking scattered; `font-medium` ineffective on weight-400 faces; Classic Share Tech Mono lacks Czech diacritics.

**Buttons (high):** Classic flat `shadow-sm` only; Hmat bypasses `Button`; no focus-visible rings; CTA duplication.

**Motion (medium-high):** No live backdrop behind orb; static speaking pixels; design-lab waveform not shipped.

---

## Part 2: Font expansion strategy

### User-requested fonts — feasibility

| Font | Czech body? | License | Plan |
|------|-------------|---------|------|
| Alan Sans | Partial | OFL (Google) | Add with warning |
| Freedom Forever | Unknown | Commercial | Only if licensed |
| Monolito / Monólita | Unlikely | Mixed | Monólita OFL display-only later |
| Onder | No | Unclear | Skip until licensed |

### Phase 1 additions (Google Fonts)

**Display / dot-matrix:** Doto, Syne Mono, Press Start 2P  
**Body / Czech:** JetBrains Mono, IBM Plex Sans, DM Sans, Space Grotesk  
**Mono upgrade:** Space Mono, Roboto Mono  
**Experimental:** Alan Sans (partial Czech)

Each font: `registry.ts` → `layout.tsx` → `globals.css` → `DesignScript.tsx` → `DesignLab.tsx`

---

## Part 3–5: Typography, buttons, live dots

See full plan sections in repo history. Summary:

- **Phase 2:** Expand `TYPE` with title/subtitle roles; migrate components; weight rules per font category.
- **Phase 3:** Unified `Button` with `surface: flat | mat-key`, depth tokens, focus rings.
- **Phase 4:** `HonzaOrbBackdrop` — energy-driven dot grid behind orb in recess; rAF waveform on speaking/thinking.

---

## Success criteria

- Design Lab offers **16+ fonts** grouped by role with live weight preview
- Every screen uses **TYPE roles**
- Buttons have **depth + press travel + focus rings**
- Orb shows **animated dot field** during thinking/speaking
- Czech specimen correct on all body-recommended fonts
- `npm run lint` + `npm run build` pass; mobile check at 430px

---

## Risks

1. Commercial fonts need license before self-hosting.
2. Classic preserved as baseline — upgrades are additive.
3. Bundle size grows with each `next/font` face — use `latin-ext` only where Czech matters.
4. Alan Sans missing some Czech glyphs — not recommended as body default.
