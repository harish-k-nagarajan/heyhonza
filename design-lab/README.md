# Design Lab — exploration archive

Standalone, self-contained HTML galleries exploring how Honza's UI could be
overhauled to feel premium, while keeping the locked identity (dot-matrix orb,
five accent hues, four nav tabs, real Czech). **These are scratch design
artifacts, not app code.** The app itself is untouched by anything in this folder.

**This folder is permanent, not throwaway** (Harish, 2026-07-16). It is the
revisitable record of the exploration — every round is kept so a future session
can reopen a rejected direction and change course. Do not delete it.

## The decision

**Hmat (tactile material) is the chosen direction** (2026-07-16). Sklo and Náboj
are parked — kept in the archive, not built. The rebuild is **Hmat only**, built
on and improved from here. Round 3 is the reference for what Hmat should become
(with the open fixes noted below). The full locked spec lives in
`PROMPT-2-rebuild.md`.

| File | Round | What it is |
|---|---|---|
| `CLASSIC-original-spec.md` | — | The **original / Classic** design system, preserved verbatim as the byte-for-byte fallback and the baseline every new design is compared against. Mirrors `../DESIGN.md`. |
| `round1-editorial-gallery.html` | 1 (rejected) | Nine quiet-editorial directions (instrument / letters / room / etc.). Found **spartan** — too restrained to read as premium. Kept for contrast. |
| `round2-premium-gallery.html` | 2 (superseded) | Three **rich** premium worlds — **Sklo** (liquid glass), **Náboj** (playful/poppy), **Hmat** (tactile material) — orb evolved with depth, live mood switcher, physical motion. Sklo + Hmat advanced to round 3; Náboj dropped. |
| `round3-refined.html` | 3 (current) | **Sklo + Hmat only**, with the three round-2 fixes: re-authored eye-led orb faces (blink + tap-to-react), a truly floating liquid-glass dock (real `feDisplacementMap`), and a custom hardware icon set. Outcome: **Hmat picked**; faces + icons + internal layout still need another pass, folded into the build. |

## How to view

They need to be served over HTTP (the glass refraction filter and web fonts
misbehave on `file://`):

```bash
cd design-lab
python3 -m http.server 4600
# open http://localhost:4600/round3-refined.html   (current)
# open http://localhost:4600/round2-premium-gallery.html   (archive)
```

Then **hover** the phone cards (3D tilt), **press** the buttons, **tap the new
faces** to see Honza react, and **flip the mood chips** at the top — every Home
hero retints live, so you can see `idle` vs `excited` pulled apart by *energy*
(glow / motion / density), not hue. **Open in Chrome** to see the real liquid-glass
refraction; Safari/Firefox get a frosted fallback.

## Where this is going

1. `PROMPT-1-interview-and-refine.md` — hand this to a **new session**. It
   interviews Harish on his pick, collects what worked / didn't, asks adaptive
   follow-ups, optionally **adds more visualized options to the gallery**, and
   once the direction is locked, writes the final rebuild prompt.
2. That session outputs `PROMPT-2-rebuild.md` — hand *that* to a **third
   session** to actually build the chosen direction into the app.

Full background: `../mega-prompt-honza-redesign.md`, `../DESIGN.md`,
`../DESIGN_AUDIT.md`, and the `honza-design-lab-round2` memory.
