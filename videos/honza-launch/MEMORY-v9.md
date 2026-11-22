# Honza launch film v9 — agent memory

## Turn 1 (pre-code)

- Pulled FrameJam `get_feedback` for `rev_f7c10fd8c6` → 18 pins (v7 cut); acceptance matrix in `ACCEPTANCE-FRAMEJAM.md`.
- Copy authority: `SCRIPT-v8.md` / `src/copy.ts` `LINES` (already aligned).

### Skills applied (rules cited)

| Skill | Path | Rules used in v9 |
|-------|------|------------------|
| **design-taste-frontend** | `harishnagarajan/.agents/skills/design-taste-frontend/SKILL.md` | Design read: premium consumer launch, Fern Mist / cream canvas; dials **8 / 6 / 4**; anti-default (no sticker orb on hero); left stage as art-directed illustration not generic blocks. |
| **image-to-code** | `harishnagarajan/.agents/skills/image-to-code/SKILL.md` | Image-first fidelity: `references/prague-panorama-outline.png` + `prague-art-direction-v1.png` analyzed before SVG; implementation matches silhouette + embankment POV, not freehand generic skyline. |
| **improve-animations** | *(not installed in workspace)* | N/A — motion survey deferred; used **transitions-polish** token rules instead. |
| **transitions-polish** | `.pencil/skills/transitions-polish/SKILL.md` | `--ease-smooth-out` / existing `EASE_OUT`; open faster than v7 sluggish Act I; travel ≤8–12px on micro-moves; close exits not delayed. |

## B1 — Act I (FilmPrague)

- Rebuilt `FilmPrague.tsx`: panorama castle-left + Charles Bridge + Týn spires; mosaic tiles + dashed Vltava (v1); embankment railing; human traveler (rect torso/legs, checkered scarf tiles, phone); coffee cart; tram on deck; obligated-reply vignettes at ~228–258; **no Ahoj bubble**.
- Stills: `renders/_review/act1-f0.png`, `act1-f90.png`, `act1-f230.png`.
- `npm run lint` pass in `videos/honza-launch`.