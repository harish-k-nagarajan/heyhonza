# Honza launch film — v8 motion

60s · 1800 frames · 30fps · SCRIPT-v8.md is copy authority.

## Acts

| Act | Frames | Picture | Rail chapter |
|-----|--------|---------|--------------|
| I Prague | 0–310 | Vltava panorama draw-on (Castle, Bridge, Týn, museum, Žižkov); walker; obligated-reply vignettes ~232–270 | `prague` |
| II Introducing Honza | 310–540 | Cream slate; glyph assembly; dominant “Introducing Honza.” | `intro` |
| III Notes → chat → call | 540–1080 | Doc panel (no orb overlay) → phone chat → call hero ~840 | `notes` → `chat` → `call` |
| IV Habit + close | 1080–1360 | Lock screen + notification; rail CTA 1280 | `notify` → `close` |
| End card | 1360–1800 | Full `FilmLockup`; Say hi to Honza | (none) |

## Beat highlights

- `pragueExit` 300 — city scales and drifts off as the glyph intro lands
- `docIn` 540 — Google Doc link + upload bar, then the notes sheet
- `knedlikyMark` 620 — coral on the teacher correction in the doc
- `chatIn` 760 — knedlíky thread (opener, slip, fix) finishes before the call
- `callMove` 820 — call UI resolves so it is the hero at `callIn` 840; mic live, then he speaks at 848
- `bannerAt` 1150 — lock notification: he says hi and continues the thread
- `lockup` 1360 — lock phone fades into the end card (no AccentSeed)

## Render

```bash
cd videos/honza-launch
npm run lint
npx remotion render HonzaLaunch renders/v8.mp4
```