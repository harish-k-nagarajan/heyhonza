# PROMPT — Honza Design Lab: interview, refine, and lock the direction

**Read this whole document before you do anything.** Your job in this session is
**not** to rebuild the app. It is to sit with me (Harish), interview me about the
exploration gallery that already exists, refine the direction — adding more
visualized options to the gallery if needed — and, only once the direction is
**locked by me**, produce the final build prompt for a *different* session.

Three sessions, three jobs. You are the **middle** one:

1. ✅ *(done)* Round-2 gallery built: three premium worlds, my calibration captured.
2. **← YOU ARE HERE.** Interview + refine + lock the direction. Output the build prompt.
3. *(later)* A fresh session runs your build prompt and rebuilds the app.

Do not skip ahead to step 3. Do not write app code. If you catch yourself editing
anything under `src/`, stop — that is the next session's job.

---

## 0. Orient before you speak (do not trust a stale snapshot)

1. **`git fetch --all --prune`.** The context's git snapshot is a photograph, not
   a live feed — a past session lost a whole day trusting a stale `main`. Confirm
   `main` has Phase 8 voice (`git log --oneline -1 main` shows `#8` / `2af8e6f`).
   You are on branch `design/lab-rebuild` (or check it out).
2. **Read, in this order:** `CLAUDE.md`, `DESIGN.md`, `DESIGN_AUDIT.md` (the
   verified F0–F8 findings), `mega-prompt-honza-redesign.md` (the original full
   build spec), and the memory index — especially `honza-design-lab-round2`,
   `honza-open-blockers`, `honza-raf-hidden-document-bug`, and
   `honza-browser-pane-events-dont-reach-react`.
3. **Open the round-2 gallery and actually look at it:**
   ```bash
   cd design-lab && python3 -m http.server 4600
   # http://localhost:4600/round2-premium-gallery.html
   ```
   Study all three worlds (Home / Chat / Call), the orb-evolution row, and the
   mood switcher. Compare against `round1-editorial-gallery.html` so you
   understand *why round 1 was rejected as spartan* and round 2 exists.
4. **Browser-pane gotchas (they will waste your time otherwise):** the pane's
   document is permanently `hidden`, so `requestAnimationFrame` and CSS
   transitions never advance, and **JS `scrollTo` desyncs the screenshot capture
   to blank frames** — scroll with the pane's **own wheel** (`computer` scroll
   action, `scroll_amount ≤ 10`) to force a repaint. Synthesized CDP clicks don't
   reach handlers; **drive interactions from in-page JS** (`el.click()`), and read
   state back with `javascript_tool`.

### What round 2 already established (the locked frame)

- **Premium means rich, not editorial.** Dimensional, glossy, tactile, alive.
  Round 1's quiet minimalism is dead as a direction.
- **Three worlds, all built as real options:** **Sklo** (liquid glass, real SVG
  `feDisplacementMap` refraction + frosted fallback), **Náboj** (playful/poppy —
  full-strength accent color blocks, chunky depth shadows, oversized type, spring
  bounce), **Hmat** (tactile material — machined recess, soft-touch keys, lit
  accent rail). Motion is **rich & physical** (hover-tilt, press, spring). The orb
  is **evolved with depth** (backlight glow, emissive shadow, glass dome) but keeps
  its exact 15×15 dot-matrix DNA.
- **Non-negotiable constraints, carried into everything you propose or build:**
  - Accent **hues locked** (idle/excited `#E8432D`, thinking `#3A7BD5`, speaking
    `#2E7D32`, oops `#C2185B`; cream `#F5F2EE`). Fix idle-vs-excited with an
    **energy** channel (glow / motion / density), never by re-hueing.
  - **Orb stays the dot matrix.** No mascots, no illustrated faces.
  - **4 nav tabs** (Domů / Chat / Hovor / Nastavení), every design.
  - **No gamification** — no streaks, XP, leagues, confetti — and **no invented
    numbers**; anything numeric must come from real state.
  - **Classic is preserved byte-for-byte** as the fallback option.
  - **Core functionality is off-limits** — conversation engine, prompts, auth,
    Supabase, `/api/*` are not yours to change. This is design only.
  - Real Czech everywhere, full diacritic set, one body typeface (no mid-word
    fallback — that is the F0 bug; Geist faces cover Czech, Share Tech Mono does not).

---

## 1. Interview me on the gallery (structured, then adaptive)

Talk to me like a design partner, not a form. Ask a focused batch, listen, then
**follow the thread** — dig into the *feeling* behind each answer, not just the
pick. Use the `AskUserQuestion` tool for the structured choices; go freeform when
I open a thread worth pulling. Cover at least:

**A. The pick.** Which world (or two) should get built all the way — Sklo, Náboj,
Hmat, or a hybrid? Why that one? What does it make me feel that the others don't?

**B. What worked / what didn't, per world.** For each of the three, what landed
and what fell flat? Be specific and invite me to be specific — "the glass felt
expensive but the text was hard to read," "the poppy blocks are fun but too
loud," "the tactile one was too subtle." Note that in the round-2 build, **Hmat
was deliberately the least resolved** (gentle material depth) — probe whether it
deserves a harder push or should be dropped.

**C. The orb evolution.** Does the depth treatment (glow / dome / energy) feel
right, too much, too little? Should the orb move/react more?

**D. The mood system.** Does flipping idle→excited now read as clearly different?
Is the energy idea working, or does it need to go further (bigger motion, sound,
haptics on real device)?

**E. Motion & interactivity.** Is the hover-tilt / press / spring the right
amount of "alive," or should it be pushed / pulled back?

**F. Fonts & Czech.** Geist Pixel (display) vs Geist Sans/Mono (body) — how much
pixel do I actually want, given Czech diacritics collapse at small pixel sizes?

Then **ask more questions based on what I say.** If an answer reveals a new need
or a strong feeling, pull on it. Keep going until you genuinely understand the
direction, not just the label. Don't rush to converge.

---

## 2. Decide: does the current gallery cover it, or do you add options?

After the interview, make an honest call:

- **If my direction is already visualized** in round 2 (a clean pick, maybe with
  lever tweaks), skip to §3.
- **If there's a gap** — a hybrid I want to see, a lever pushed harder (e.g. Hmat
  in brushed metal instead of ceramic, glass with a deeper tinted well, a bolder
  Náboj), a new idea that surfaced, or a screen not yet shown (Settings, Welcome,
  Onboarding) — then **build it into the gallery and show me.** Iterate the
  `round2-premium-gallery.html` file or start a `round3-*.html` in `design-lab/`.

Rules for any new options you visualize:
- Same locked constraints as §0 (accents, orb DNA, 4 tabs, no gamification/fake
  numbers, real Czech).
- **Genuinely interactive and premium** — real motion, real glass if glass, not a
  flat mock. This is the whole reason round 1 failed.
- Use the real orb pixel maps (copy verbatim from `src/components/honza/
  HonzaOrb.tsx`), the real palette (`src/components/honza/theme.ts`), and the real
  Czech copy already in the round-2 gallery.
- Serve it, screenshot it via the pane's wheel-scroll, and bring it back to me.
- **Loop** §1–§2 as many times as it takes. Each loop: show, get reaction, refine.
  Stop when I say the direction is locked.

---

## 3. Lock the direction, then write the build prompt

Once I've explicitly signed off:

1. **Restate the locked direction** in plain words: which world(s) get built,
   every lever setting (material, refraction strength, pop intensity, corners,
   fonts for display and body), which screens, and anything I asked to be
   different from what the gallery showed. Get my final "yes."
2. **Write `design-lab/PROMPT-2-rebuild.md`** — a single self-contained build
   prompt for a fresh session, in the same spirit as
   `mega-prompt-honza-redesign.md` but **pinned to the locked direction** (no more
   open exploration; the design decision is made). It must carry:
   - The §0 orientation + fetch-first discipline + browser-pane gotchas.
   - The full locked-constraints list (accents, orb DNA, 4 tabs, no gamification /
     fake numbers, Classic byte-for-byte, no core-functionality changes, secrets
     stay server-side per `CLAUDE.md`).
   - The **primitives-before-features** spine and phased plan from the mega-prompt,
     adapted: token contract + `data-design` runtime with a pre-paint script,
     mood→expression engine, per-screen behaviour hooks, then the chosen world(s)
     across **Home / Chat / Call / Settings** + the pre-app surfaces (Welcome /
     Sign-in / Onboarding), then the **Design Lab in Settings** (live design + font
     switch, Classic returns the shipped app exactly, choice persists with no
     flash).
   - A per-phase **verification gate walked in a real browser**, and the honest
     status vocabulary (REAL / STUB / PARTIAL).
   - A pointer to `round2-premium-gallery.html` (and any round-3 file) as the
     visual source of truth for the chosen world.
3. **Update the memory** `honza-design-lab-round2` (or add a new one) with the
   locked decision, and tell me the exact next step: *"Start a new session and
   paste `design-lab/PROMPT-2-rebuild.md`."*

Then **stop.** Do not begin the rebuild in this session.

---

## Operating notes

- Stop for me at two points: after the interview (to converge or add options),
  and at final sign-off (before writing the build prompt). Don't railroad past me.
- Everything you *show* must be verified rendering in a browser, not reasoned
  about — `CLAUDE.md`'s rule. "Should render" is not shown.
- Keep it warm and specific. I responded badly to a round that was technically
  fine but emotionally generic. The point of this product is that Honza feels like
  a friend I'm glad to hear from. Hold the design to that.
