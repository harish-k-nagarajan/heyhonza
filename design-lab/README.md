# Design Lab — exploration archive

Standalone, self-contained HTML galleries exploring how Honza's UI could be
overhauled to feel premium, while keeping the locked identity (dot-matrix orb,
five accent hues, four nav tabs, real Czech). **These are scratch design
artifacts, not app code.** The app itself is untouched by anything in this folder.

| File | Round | What it is |
|---|---|---|
| `round1-editorial-gallery.html` | 1 (rejected) | Nine quiet-editorial directions (instrument / letters / room / etc.). Harish found them **spartan** — too restrained to read as premium. Kept only for contrast. |
| `round2-premium-gallery.html` | 2 (current) | Three **rich** premium worlds — **Sklo** (liquid glass), **Náboj** (playful/poppy), **Hmat** (tactile material) — with the orb evolved with depth, a live mood switcher, and real physical motion (hover-tilt, press, spring). This is the live direction. |

## How to view

They need to be served over HTTP (the glass refraction filter and web fonts
misbehave on `file://`):

```bash
cd design-lab
python3 -m http.server 4600
# open http://localhost:4600/round2-premium-gallery.html
```

Then **hover** the phone cards (3D tilt), **press** the buttons, and **flip the
mood chips** at the top — every Home hero retints live, so you can see `idle`
vs `excited` finally pulled apart by *energy* (glow / motion / density), not hue.

## Where this is going

1. `PROMPT-1-interview-and-refine.md` — hand this to a **new session**. It
   interviews Harish on his pick, collects what worked / didn't, asks adaptive
   follow-ups, optionally **adds more visualized options to the gallery**, and
   once the direction is locked, writes the final rebuild prompt.
2. That session outputs `PROMPT-2-rebuild.md` — hand *that* to a **third
   session** to actually build the chosen direction into the app.

Full background: `../mega-prompt-honza-redesign.md`, `../DESIGN.md`,
`../DESIGN_AUDIT.md`, and the `honza-design-lab-round2` memory.
