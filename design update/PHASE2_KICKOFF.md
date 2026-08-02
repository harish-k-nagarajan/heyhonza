# Phase 2 kickoff — copy into a new chat

Use this **after** merging `cursor/design-elevation-1034` into `main`.

---

## Prompt

```
Honza — Design Elevation Plan, Phase 2: Typography system

Plan doc (authoritative): design update/DESIGN_ELEVATION_PLAN.md
  → Section: "Phase 2 — Typography system (detail)"
  → Phase table row: Phase 2 | Typography system (TYPE roles, migration)

Also read:
- design update/SHIPPED_DESIGN.md — locked design; do NOT change fonts or re-add Design Lab
- DESIGN.md — typography section (update when Phase 2 is done)
- src/lib/design/typography.ts — existing TYPE scale
- src/lib/design/registry.ts — SHIPPED_* constants (Hmat Metal, Doto, Space Grotesk)
- MEMORY.md — "Design finalized" section

Git:
- Checkout main and pull after merge
- Create branch: cursor/typography-phase-2-1034
- Open PR against main when done

Goal:
Expand TYPE roles and migrate screens off ad-hoc font/tracking classes so hierarchy
is consistent: Doto for display (700 on buttons via --font-display-weight-ui),
Space Grotesk for Czech body (weights allowed where useful).

Migration priority: Hmat chat, call, settings, landing, dock, onboarding;
then SectionLabel, Button, Label.

Out of scope: buttons depth (Phase 3), orb backdrop (Phase 4), fonts, Design Lab.

Verify: npm run lint, npm run build, manual check at ~430px phone stage.
Update DESIGN.md and MEMORY.md when complete.
```

---

## Branch convention

| Phase | Branch (off `main`) |
|-------|---------------------|
| 2 Typography | `cursor/typography-phase-2-1034` |
| 3 Buttons | `cursor/button-depth-phase-3-1034` |
| 4 Orb backdrop | `cursor/orb-backdrop-phase-4-1034` |

Each phase = **new branch**, **new PR**, after the previous phase is merged.
