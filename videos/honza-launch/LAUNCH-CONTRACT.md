# Honza launch — pass contract

Split film. Pass 1 owns frames **0–839** (Act I, intro, notes, chat). Pass 2 owns **840–1799** (call, notify, lock, end card). Copy is `SCRIPT-v8.md` only, already mirrored in `src/copy.ts` `LINES`.

## Layout

1920×1080, 30fps. Until `BEATS.lockup` (1360) the frame is a centered row:

| Column | Size | Contents, frames 0–839 |
|--------|------|------------------------|
| Left stage | 820×900 | Prague, then intro glyph, then the notes sheet, then the phone |
| Gap | 72 | |
| Right rail | 620 | `FilmRail` stack for the active chapter |

Prague drawing box inside the stage is 820×600, top-weighted. The notes sheet is 600×860, centered, full stage height. The phone is 430×860 (`PHONE_W` / `PHONE_H`), scale 1, radius 28.

## Beats 0–839

Picture and rail share `src/timing.ts`. Do not retune these in Pass 2.

| Frame | Beat | Picture |
|------:|------|---------|
| 0 | rail `prague[0]` | Panorama ink starts. Bridge band first, then castle → spires → tower. |
| 45 | `prague[1]` | Skyline still drawing. |
| 90 | | Castle, bridge, and towers readable. Tram not on the deck yet. |
| 108–140 | | Vltava dashes draw under the arches. |
| 116–134 | | Tram fades onto the bridge deck, then travels right through frame 292. |
| 120 | `prague[2]` | |
| 136–200 | | Traveler draws head to feet (v1 plate: coat, scarf, backpack, phone). |
| 165 | `prague[3]` | |
| 230 | `prague[4]` | Traveler complete. No speech bubble. Tram on the bridge. |
| 280 | `prague[5]` | |
| 300–342 | `pragueExit` | City scales to 0.82, drifts up-left, fades in the last third. |
| 310 | `introIn`, rail intro | Left stage stays clear of the glyph until the city is gone. |
| 346–356 | | Dot grid. |
| 354–366 | | Dots take fern and coral. |
| 358–374 | | Recess eases in (scale 0.96 → 1). Dots leave. |
| 360 | `introTitle` | **Introducing Honza.** |
| 388 | | “Your tutor” / “Your friend” swap. |
| 400, 460, 520 | intro lines | Rail only. |
| 528–556 | `notesMove` | Intro leaves 12px up. Notes sheet opens, scale 0.96 → 1, 28 frames, ease-out. |
| 540 | `docIn` | Notes rail. |
| 548–578 | `docBody` | Note lines rise 8px, 2 frames apart. |
| 620 | `knedlikyMark` | Coral mark on `Knedlíky, ne knedlík.` |
| 680 | notes line 3 | Rail. |
| 748–784 | `chatMove` | Sheet leaves. Phone enters, scale 0.96 → 1, 36 frames, ease-out. |
| 760 | `chatIn` | Chat rail. |
| 768 | `honzaOpen` | Honza’s first line rises 8px. |
| 788–848 | `typeStart` → `send` | Composer types the slip. Send is frame 848, outside this pass. |

`callMove` is **824**. By frame 839 the call layer has barely started (`callInner` threshold is 0.32 of a 42-frame move). Pass 1 does not retune it. Pass 2 owns the call picture from **840** (`callIn`), including `FilmCall`.

## Files Pass 2 must not break

| File | Why |
|------|-----|
| `src/timing.ts` | `BEATS` and `RAILS` are the shared clock. `callIn` stays 840, `callSpeak` 862, `fix` 900, `lockMove` 1068, `notifyIn` 1080, `bannerAt` 1150, `closeIn` 1280, `lockup` 1360, `endCta` 1388. |
| `src/copy.ts` `LINES` | Script v8 strings. |
| `src/FilmCall.tsx` | Pass 2 picture. Not edited in pass 1. |
| `src/FilmLockPhone.tsx` | Pass 2 picture. |
| `src/FilmLockup.tsx` | Pass 2 end card. |
| `src/scene.ts` `cityExit`, `notifySpring`, `rise` | Call, lock, and end card still use them. |
| `src/HonzaLaunch.tsx` phone handoff | `callMove` / `lockMove` / `endMove` math. Pass 1 only changed the notes and chat *enter* (ease-out, scale 0.96). |
| `public/prague-panorama.png` | Traced plate for Act I. |
| `public/prague-traveler.png` | v1 traveler, bubble removed. |
| `src/prague-trace.ts` | Stroke runs. Regenerate only with `scripts/trace-prague.py`. |
| `src/FilmPrague.tsx` | Act I. Stroke mask over those plates. |

Pass 2 may edit `FilmCall`, `FilmLockPhone`, `FilmLockup`, and the lock/end section of `HonzaLaunch.tsx`. It should not replace the Prague plates with primitive rectangles, and it should not put an orb on the notes sheet.
