# Honza launch film

1:49 · 3268 frames · 30fps · 1920×1080. Product UI is the live Honza components. Marketing lines are the sentences below, in full, in Inter. Each one stays up long enough to read aloud. Doto is only the small “Prague” under the drawing and the URL on the end card. The button is the site’s coral pill.

**Promise:** You live in Prague and still answer in English. You and your teacher already keep a Google Doc of running notes. You don’t revise it, so you forget the Czech. Honza reads the doc and brings those sentences back. He is not a replacement for the teacher.

## Beats

| # | Beat | Frames | What reads |
|---|------|--------|------------|
| 1 | Prague | 0–285 | The dot postcard draws on, hill then roofs then the bridge then the river, while “You live in Prague.” is up. Then: “Someone asks you something in Czech, and the answer comes out in English.” |
| 2 | Notes | 285–1122 | The sheet arrives with “Czech Lessons”. About 8 frames later the notes rise in once. Five sentences, one at a time, from “You already have a teacher.” through “you forget the Czech you just learned.” |
| 3 | Chat | 1122–1874 | “Paste him that doc.” through “The sentences he brings back are the ones from your notes.” The thread shows the real Czech correction. |
| 4 | Call | 1874–2199 | “When you want to say them, you call him.” Then: “You speak, he answers out loud, and the call stays with the chat.” |
| 5 | He starts | 2199–2831 | A conversation he already opened. “He also starts when you had no plan to practice.” Then the one-to-three line. Then going over the sentence again. No clock. |
| 6 | Level | 2831–2980 | “He matches your level, and how hard the correction is.” |
| 7 | End | 2980–3268 | “Try the sentences from your last class before they go.” Then the button, “Free to start. It takes a minute.”, and `heyhonza.vercel.app`. The recess walks the mood colors. No mood names. |

## Prague

`FilmPrague.tsx` rebuilds the postcard from the same rounded-square dots as the orb, on cream `#F5F2EE`. Castle and spires, a band of roofs, Charles Bridge and its towers, the river, two boats, a few trees, a small Czech flag. As the doc arrives, the dots thin into the cream where they stand. They do not form a glyph and they do not fly.

## Doc

Title `Czech Lessons` is on the page when it arrives. It is not typed. Body lines are Czech with the English beside them. Teacher is `#1F6B4A`. You is `#B4532A`. No caret.

## Render

```bash
cd videos/honza-launch
npx remotion render HonzaLaunch renders/v5.mp4
```
