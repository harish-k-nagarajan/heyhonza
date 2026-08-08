# Animation & Chat Motion Plans

Plans for Honza chat screen motion and personality. Written for handoff to an implementation agent.

| # | Document | Status | Notes |
| --- | --- | --- | --- |
| — | [CHAT_MOTION_DESIGN_SPEC.md](./CHAT_MOTION_DESIGN_SPEC.md) | **DRAFT** | Master spec — read/edit before implementing |

## Recommended execution order

1. **Review** `CHAT_MOTION_DESIGN_SPEC.md` — resolve §14 open questions.
2. **Phase 0** — Motion tokens (`globals.css`, `tailwind.config.ts`).
3. **Phase 1–2** — Typing bubble + reply choreography (highest product impact).
4. **Phase 3** — Orb dot halo (can parallelize with 1–2).
5. **Phase 4–6** — Craft pass, channel pulse, drawer exit.
6. **Phase 7** — P2 polish if time permits.

## Dependencies

```
Phase 0 (tokens)
    └── Phase 4 (craft pass)

Phase 1 (typing choreography)
    ├── Phase 2 (UI wire-up)
    └── Phase 5 (channel pulse)

Phase 3 (halo) — independent

Phase 6 (drawer) — independent
```

## For implementers

- Do **not** improvise durations or easing — use values in the spec (sourced from Emil Kowalski AUDIT.md).
- If `git rev-parse --short HEAD` ≠ `1b639b9`, re-verify file paths and line numbers before editing.
- Definition of done: `npm run lint` + `npm run build` + manual 430px feel check per spec §12.
- Update `MEMORY.md` when shipped.
