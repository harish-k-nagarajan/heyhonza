# Honza Design Elevation Plan

Authoritative phased plan for typography, buttons, and orb motion upgrades.

| Doc | Purpose |
|-----|---------|
| **This file** | Full plan + phase status |
| [`SHIPPED_DESIGN.md`](./SHIPPED_DESIGN.md) | Locked fonts/surface (read before any phase) |
| [`PHASE2_KICKOFF.md`](./PHASE2_KICKOFF.md) | Copy-paste prompt for the next agent chat |

---

## Shipped design (finalized — do not regress)

See [`SHIPPED_DESIGN.md`](./SHIPPED_DESIGN.md).

| Token | Value |
|-------|--------|
| Surface | **Hmat Metal** |
| Short labels / buttons | **Doto** (500 labels, 700 buttons) |
| Long Czech text | **Space Grotesk** |

Design Lab and font switching were **removed**. Constants live in `src/lib/design/registry.ts` (`SHIPPED_*`).

**PR / branch for Phases 0–1 + finalize:** `cursor/design-elevation-1034` → merge to `main`, then start Phase 2 from `main`.

---

## Executive summary

Remaining gaps after font finalization:

1. **Typography hierarchy is inconsistent** — `TYPE` in `src/lib/design/typography.ts` is barely adopted; ad-hoc sizes and tracking everywhere.
2. **Buttons are split across two systems** — flat Classic `Button.tsx` vs raw `mat-key` Hmat buttons.
3. **No live orb backdrop** — speaking/thinking lack dot-matrix / waveform motion behind the face.

Order: **Phase 2 typography → Phase 3 buttons → Phase 4 live dots → Phase 5 polish**.

---

## Phased delivery

| Phase | Scope | Branch | Status |
|-------|-------|--------|--------|
| **0** | Plan + audit checklist | `cursor/design-elevation-1034` | Done |
| **1** | Font exploration + Lab (later removed) | `cursor/design-elevation-1034` | Done → **finalized** |
| **1b** | Lock Hmat Metal + Doto + Space Grotesk; remove Lab | `cursor/design-elevation-1034` | Done |
| **2** | Typography system (`TYPE` roles, migration) | **`cursor/typography-phase-2-1034`** off **`main`** | **Done** |
| **3** | Button unification (depth, focus rings, shared API) | `cursor/button-depth-phase-3-1034` off `main` | Pending |
| **4** | Live orb dot/waveform backdrop | `cursor/orb-backdrop-phase-4-1034` off `main` | Pending |
| **5** | Polish audit closure | TBD | Pending |

---

## Phase 2 — Typography system (detail)

**Read first:** `DESIGN.md` (typography), `src/lib/design/typography.ts`, `SHIPPED_DESIGN.md`.

**Tasks:**

1. Expand `TYPE` — add `title`, `subtitle`, `button`; document Doto vs Space Grotesk weight rules.
2. Migrate Hmat surfaces (chat, call, settings, landing, dock, onboarding) off ad-hoc `text-[11px] tracking-[…]` classes.
3. Migrate shared primitives: `SectionLabel`, `Button`, `Label` where still on legacy patterns.
4. Display (Doto): hierarchy via **size + tracking**; buttons use `--font-display-weight-ui` (700).
5. Body (Space Grotesk): allow `font-medium` / `font-semibold` where hierarchy needs weight.
6. Update `DESIGN.md` Design Lab / typography section to reflect shipped fonts (no Lab).
7. `npm run lint` + `npm run build`; manual ~430px check.

**Out of scope:** Design Lab, font changes, buttons (Phase 3), orb backdrop (Phase 4).

---

## Phase 3 — Buttons (summary)

- Extend `Button.tsx` with `surface: flat | mat-key`, depth tokens, focus rings.
- Wire `Pressable` / haptics; migrate duplicated CTAs.
- Contrast pass on all five mood backgrounds.

---

## Phase 4 — Live orb backdrop (summary)

- `HonzaOrbBackdrop` — dot grid behind face in recess; amplitude from `--energy`.
- Integrate chat hero + call (Classic + Hmat).
- `prefers-reduced-motion`: static grid.

Prototype reference: `design-lab/round2-premium-gallery.html` (waveform comment).

---

## Success criteria (remaining)

- [x] Every primary screen uses **`TYPE` roles** (no scattered ad-hoc typography)
- [ ] Buttons have **depth + press travel + focus rings**
- [ ] Orb shows **animated dot field** during thinking/speaking
- [ ] `npm run lint` + `npm run build` pass; mobile check at 430px
- [x] Shipped fonts locked (Doto + Space Grotesk + Hmat Metal)

---

## Historical note (Phases 0–1)

Font exploration and Design Lab were built then **removed** after choosing Doto + Space Grotesk. Early plan sections about 16+ Lab fonts and Alan Sans are obsolete; kept in git history only.
