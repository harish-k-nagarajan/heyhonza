# Honza launch film — production notes

## No external imagery

This composition does not load plates, stock, AI stills, Higgsfield, or `staticFile('plates/...')`. There is no `plates/` folder.

The only raster the film may paint is **favicon-sized product chrome already in `public/`**:

- `/apple-touch-icon.png` — app icon inside `LandingIphoneNotificationPreview`

`/images/iphone-lockscreen.jpg` is not in the repo. The morning beat uses `FilmLockPhone`, the same bezel, island, and banner as `LandingIphoneNotificationPreview`, with the wallpaper painted inside the clipped screen and the banner driven by the frame (`.t-toast` is forced visible in `film-globals.css`).

## Components imported from the app (not redrawn)

| Import | Role in film |
|--------|----------------|
| `HmatPresenceRecess` | Chat hero well + lockup display well (`variant="display"`, size 148 — same as `LandingHero`) |
| `HmatOrb` | (via recess) ceramic face; moods from `HonzaOrbState` |
| `HmatHonzaBubble` / `HmatUserBubble` | Thread |
| `HmatChatThread` | Scroll region |
| `HmatChatComposerRow` | Composer + send |
| `HmatScreenTitle` / `HmatStatusChip` | Czech status; never the waiting gate |
| `LandingIphoneNotificationPreview` | Morning beat |
| `HONZA_STATE_COLORS` / `CREAM_CANVAS` / `useMoodStore` | Washes + `--accent` |
| `TYPE` | Homework panel + lockup URL |
| `DEMO_CHAT_BEATS` / `LANDING_DEMO_CONVERSATION` / `getStrings("cs")` | Locked copy |
| `applyDesignToRoot` / `LocaleProvider` | Hmat Metal + Czech UI |
| `chatTitle` / `chatChip` / `resolveChatStatus` | Status strings |

## One-off (allowed)

`FilmGoogleDoc.tsx` is the shared-notes panel. It uses `TYPE` + Inter / Doto only. No Google logo bitmap.

## Motion

Frame-driven enters and exits. A scene enters about 12px over about 18 frames, bezier (0.22, 1, 0.36, 1), no bounce. A sentence rises about 8px over 10 frames as a whole sentence. Leaving accelerates into the cut. There is no long crossfade between two busy screens.

The shared doc is two moves: the page and its title land together, then the whole body rises in once.

Prague is `FilmPrague.tsx`. The dots turn on left to right, hill, roofs, bridge, river, then thin into the cream. They do not fly to the next scene. `FilmMotes` no longer draws a glyph.

Honza’s talk and blink are stepped from the frame. The product CSS clocks do not seek, and a still was catching two mouth shapes at once.

## Render

```bash
cd videos/honza-launch
npx remotion render HonzaLaunch renders/v5.mp4
```
