# Honza launch film — production notes

## No external imagery

This composition does not load plates, stock, AI stills, Higgsfield, or `staticFile('plates/...')`. There is no `plates/` folder.

The only raster the film may paint is **favicon-sized product chrome already in `public/`**:

- `/apple-touch-icon.png` — app icon inside `LandingIphoneNotificationPreview`

`/images/iphone-lockscreen.jpg` is not in the repo. The morning beat uses `FilmLockPhone`, the same bezel, island, and banner as `LandingIphoneNotificationPreview`, with the wallpaper painted inside the clipped screen and the banner driven by the frame (`.t-toast` is forced visible in `film-globals.css`).

## Components imported from the app (not redrawn)

| Import | Role in film |
|--------|----------------|
| `HmatPresenceRecess` | Intro orb, chat/call wells, end-card display well (`variant="display"`, size 148) |
| `HmatOrb` | (via recess) ceramic face; moods from `HonzaOrbState` |
| `HmatHonzaBubble` / `HmatUserBubble` | Thread |
| `HmatChatThread` | Scroll region |
| `HmatChatComposerRow` | Composer + send |
| `HmatScreenTitle` / `HmatStatusChip` | Czech status; never the waiting gate |
| `LandingIphoneNotificationPreview` | Morning beat (via `FilmLockPhone` chrome) |
| `HONZA_STATE_COLORS` / `CREAM_CANVAS` / `useMoodStore` | Washes + `--accent` |
| `TYPE` | Call clock |
| `DEMO_CHAT_BEATS` / `LANDING_DEMO_CONVERSATION` / `getStrings("cs")` | Locked Czech copy |
| `applyDesignToRoot` / `LocaleProvider` | Hmat Metal + Czech UI |
| `chatTitle` / `chatChip` / `resolveChatStatus` | Status strings |

## One-off (allowed)

`FilmGoogleDoc.tsx` is the shared-notes panel. It uses Inter only. No Google logo bitmap. The teacher's `Knedlíky, ne knedlík.` line is marked in coral from frame 564.

## Motion

Frame-driven. A sentence rises about 8px over 10 frames as a whole sentence.

Scene changes are continuity objects, not a 15-frame opacity-and-scale crossfade:

| Window | Move |
|--------|------|
| 288–330 | Prague scales to ~0.82, drifts up-left, fades in the last third. Orb rolls in from −180px / −28deg / 0.86 with a coral bloom. |
| 498–530 | Same orb travels to the top of the notes. Page opens from that recess. |
| 708–760 | Coral `knedlíky` travels from the notes line into the phone. Page resolves into chat. |
| 1068–1110 | Shared phone shell. Chat recess grows into the call recess; thread leaves after. |
| 1278–1320 | Phone pulls back into `FilmLockPhone`. Banner waits until 1428. |
| 1560–1800 | Banner coral travels into the end-card recess. |

The notification banner is the one spring: opacity, a 22px settle, about 1.6% scale overshoot, then rest (`notifySpring` in `scene.ts`).

Prague is `FilmPrague.tsx`. Strokes draw on, then fills. Order: bridge and gothic tower (0–2s), dome and roofs (2–4s), river and tram (4–6.5s), tree / statue / bench (6.5–8.5s), learner and `Ahoj` with the fourth line (~7.1s). After that the only ongoing motion is the tram and a slight river drift. No word “PRAGUE” under the drawing.

Honza’s talk and blink are stepped from the frame. The product CSS clocks do not seek.

There is no voiceover. `FilmSound` plays a quiet bed and one notification at the banner. The captions carry the film if both are muted.

## Render

```bash
cd videos/honza-launch
npx remotion render HonzaLaunch renders/v7.mp4
```
