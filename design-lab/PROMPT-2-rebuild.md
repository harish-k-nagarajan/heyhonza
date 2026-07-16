# PROMPT — Honza rebuild: Hmat (the locked direction)

**Read this entire document before running a single command.** You are the
**build** session. The exploration is over and the design decision is **made** —
your job is to build it into the app, not to re-explore. Everything you need is
here; where something is genuinely ambiguous, resolve it toward the outcome
narrative in `../mega-prompt-honza-redesign.md` §1.

Three sessions, three jobs. You are the **third**:
1. ✅ Exploration galleries built (rounds 1–4).
2. ✅ Interview + refine + **lock** (this produced the decision below).
3. **← YOU ARE HERE.** Build the locked direction — **Hmat** — into the app.

There is **no open design choice left**. Do not generate new directions, do not
add worlds, do not "improve" the concept out from under the decision. Build Hmat.

---

## 0. START HERE — fetch first, verify the base, learn the gotchas

### 0.1 `git fetch` before you form a single belief about this repo.

```bash
git fetch --all --prune
git checkout main
git pull                      # main must be at 2af8e6f or later
git checkout -b design/hmat-rebuild
```

**This is the most important instruction in the document.** A context snapshot of
git state is a photograph, not a live feed. A past session lost a whole day
trusting a stale `main` and built a 3-tab app for a 4-tab product. `main` already
contains BUILD_SPEC Phase 8 (voice), merged as PR #8, commit `2af8e6f`, which
added `/call` as a **fourth** primary surface.

### 0.2 Gate 0 — run this first and confirm every line prints:

```bash
git log --oneline -1 main | grep -q "#8" && echo "OK main has Phase 8"
test -f src/app/call/CallClient.tsx && echo "OK call client"
test -f src/app/api/tts/route.ts     && echo "OK tts route"
grep -q "ROUTES.call" src/components/layout/BottomNav.tsx && echo "OK 4-tab nav"
! grep -qE '^[[:space:]]*window\.requestAnimationFrame\(' src/components/honza/HonzaOrb.tsx \
  && echo "OK orb rAF fix present"
```

All five must print. If any fails, **stop and fetch** — the difference is your
checkout, not the repo. Do not delete a failing check to make it pass.

Then: `npm run dev` boots; sign in with `node scripts/dev-signin.mjs <email>`
(sends no email, prints an `/auth/callback` URL); load `/call` and see it render.

### 0.3 Read, in this order

`CLAUDE.md` → `DESIGN.md` → `DESIGN_AUDIT.md` (verified F0–F8, esp. **F0** the font
bug and the idle-vs-excited defect) → `BUILD_SPEC_STATUS.md` → `TASKS.md` →
`MEMORY.md` → `../mega-prompt-honza-redesign.md` (the full architecture doctrine;
this prompt pins its exploration but inherits its **primitives-before-features**
spine and phased gates). Memory to read first: `honza-fetch-before-you-believe-git-state`,
`honza-design-lab-round2`, `honza-open-blockers`, `honza-share-tech-mono-cannot-render-czech`,
`honza-raf-hidden-document-bug`, `honza-browser-pane-events-dont-reach-react`.

### 0.4 Browser-pane gotchas — these WILL waste your time otherwise

Verified repeatedly across the exploration sessions:
- **The pane's document is permanently `hidden`.** `requestAnimationFrame` never
  fires and CSS transitions never advance. An element can have inline `opacity:1`
  and computed `opacity:0` forever. Check the **inline** value before concluding
  something is broken.
- **Scrolling the pane hangs** on heavy pages (many shadows/filters/gradients) —
  both wheel-scroll and JS `scrollTo` (which also desyncs the screenshot to blank
  frames). To screenshot content that isn't at the top: **move that node to the
  top of the DOM via JS at natural scroll-0, then screenshot** — do not try to
  scroll to it. **`resize_window` works** and does not hang; use a tall/wide
  viewport to fit more on screen (mind mobile media-query breakpoints — a viewport
  narrower than your `max-width` query will squish the phone stage).
- **Live SVG `feDisplacementMap` / backdrop-filter glass hangs the renderer** in
  the pane. (Not relevant to Hmat, which uses no glass — noted so you don't
  reintroduce it.)
- **CDP clicks/keys don't reach React.** Synthesized clicks never hit the DOM.
  Probe first; drive React from in-page JS (`el.click()`), or seed `localStorage`
  and reload; read state back with `javascript_tool`.
- **Never run `npm run build` while `next dev` is up** — it overwrites `.next` and
  strips the running dev server's CSS. Looks catastrophic; it's an artifact.
  Restart dev.
- **Clear `localStorage` before testing DB persistence** — the local store is a
  live alternative explanation for anything that renders.

---

## 1. The decision (locked 2026-07-16) — build this, nothing else

**Hmat — the tactile-material world.** Chosen by Harish after rounds 2–4. Sklo
(liquid glass) and Náboj (poppy) are **parked in the archive** — kept in
`design-lab/`, not built.

### Visual source of truth

- **`design-lab/round4-hmat.html`** — the current, cleaned-up Hmat reference: all
  four screens (Home / Chat / Call / Settings) at 406×812, the re-authored orb
  faces, the custom icon set, the machined material, deep keys, lit channel,
  floating dock. **Match this.** Open it in Chrome (served: `cd design-lab &&
  python3 -m http.server 4600` → `http://localhost:4600/round4-hmat.html`).
- `design-lab/round3-refined.html`, `round2-premium-gallery.html` — archived prior
  rounds (Sklo + Hmat, and all three worlds). Reference only.
- `design-lab/CLASSIC-original-spec.md` — the Classic baseline, preserved.

The orb pixel maps, palette, and Czech copy in `round4-hmat.html` are lifted from
the real app (`src/components/honza/HonzaOrb.tsx`, `theme.ts`) — but the **faces
were re-authored** in round 4 (see §4.3); port the round-4 maps, not the originals.

### What Hmat ships as

**Three selectable designs**, switched in Settings → Design Lab:
1. **Hmat Metal** — brushed cream-metal surface, visible brushed grain.
2. **Hmat Ceramic** — warm matte ceramic, smooth (grain off / soft).
3. **Classic** — the shipped app, **byte-for-byte**, Share Tech Mono and all.

Metal and Ceramic are the **same Hmat layout and components** differing only in
surface tokens (material gradient, grain, warmth). Do not fork the component tree
for them — they are two token blocks, one design family (see §5.P1).

---

## 2. Scope fence (unchanged from the mega-prompt — restated so it can't erode)

### 2.1 Persona
One. Harish. An adult learning Czech, on a phone, daily. No teacher/admin/second
user. Build for no one else.

### 2.2 Navigation — 4 tabs, all designed
Signed-in: `/` Home · `/chat` · `/call` · `/settings` (Settings holds the Design
Lab). Pre-app: `/welcome` · `/signin` · `/onboarding`. Every tab and surface gets
the Hmat treatment; none is a stub.

### 2.3 Out of scope
| Out | Why |
|---|---|
| Structured "correction UI" | Engine returns unstructured prose; regex-detecting corrections teaches the wrong thing. Needs an engine contract change first. **Do not fake it.** |
| Scheduling + social | Hard rule in `CLAUDE.md`. |
| Streaks, XP, leagues, badges, confetti | §3 below. |
| Changing conversation engine, prompts, auth | `conversation-engine.ts`, Supabase, `/api/*` are not yours to rewrite. This is design. |
| New providers/secrets/env vars | The env is settled; secrets stay server-side per `CLAUDE.md`. |
| Custom SMTP / Vercel deploy / branch housekeeping | Unrelated pre-launch tasks. Open **one** PR for this design work. |

---

## 3. Locked constraints — non-negotiable, restated because hour six erodes them

- **Classic is preserved byte-for-byte.** It is the baseline the Lab compares
  against. Refactor its behaviour onto shared hooks if you like; **do not touch
  its markup or its font** (it keeps Share Tech Mono and the F0 bug on purpose).
- **The orb stays the 15×15 dot matrix.** No mascots, no illustrated faces, no
  cartoons. Honza is hardware. The round-4 faces are re-authored *within* that DNA.
- **4 nav tabs, including `/call`.** Every design, every time.
- **No gamification, no fake numbers.** No streaks/XP/leagues/badges/confetti, and
  **no rendered number that isn't computed from real state** in the store. If the
  data doesn't exist, the UI element doesn't exist.
- **Accent hues are locked** (idle/excited `#E8432D`, thinking `#3A7BD5`, speaking
  `#2E7D32`, oops `#C2185B`; cream `#F5F2EE`). Fix idle-vs-excited with an **energy
  channel** (glow / motion amplitude / channel light / density) — **never by
  re-hueing**.
- **No secrets in client code, no new env vars.** All model/TTS calls stay behind
  Route Handlers.
- **No hardcoded design values in components.** Colours, radii, fonts come from
  tokens. A hex in a `.tsx` is the next migration.
- **The debug pill (`MoodCycler`) does not ship, get styled, or get turned on.**
  Your job is to make the real UI express what it exposes, so it's redundant.

---

## 4. The Hmat design spec (pinned — match `round4-hmat.html`)

### 4.1 Material & surface
- **Recess:** the orb sits in a `mat-recess` — an inset well (inner top shadow +
  bottom highlight) machined into the panel. This is the signature Hmat move; the
  character leads every screen from inside it.
- **Cards:** `mat` (outset: inset top-light + bottom-shadow, soft drop shadow) and
  `mat-metal` (brushed-gradient variant) on the cream-warmed base.
- **Metal vs Ceramic:** Metal = cool cream-metal gradient + a fine brushed grain
  (`repeating-linear-gradient` + soft-light noise). Ceramic = warmer, smoother
  matte, grain off. Both are token blocks; see the `.mat*`, `.mat-bg`, and grain
  CSS in `round4-hmat.html`.

### 4.2 Keys, channel, dock
- **Deep keys (`mat-key`):** 6px mechanical travel — `box-shadow: 0 6px 0 …`
  resolving to `translateY(5px)` + collapsed shadow on `:active`. Send / call
  controls are keys.
- **Lit accent channel (`mat-channel`):** a recessed channel whose inner glow is
  the mood accent, brightness scaled by `--energy` (idle dim → excited bright).
  This is a primary energy expression — carry it into the mood engine (§5.P2).
- **Floating dock:** detached from the bottom edge (`left/right:16px; bottom:14px`),
  rounded, material (not glass), with the four tabs. Active tab tinted with the
  accent. The dock **must clear content** — the composer is pinned above it; nothing
  overlaps. (Round-4 fixed a bug where content overflowed the frame — replicate the
  disciplined layout: header pinned top, composer pinned above dock, content in
  between, all inside a fixed 406×812-equivalent responsive frame.)

### 4.3 The orb, evolved + re-authored faces
- Keep the depth treatment: backlight glow, emissive drop-shadow, specular dome,
  all scaled by the mood's `--energy`. **Push reactivity further** than Classic:
  a **blink loop** (eyes collapse to a line ~every 5s, faster with energy) and an
  **answer/press reaction pop** (scale bump on send / on a correct reply — driven
  by real events, not invented).
- **Port the round-4 pixel maps, not the originals.** The round-4 maps
  (`MAPS` in `round4-hmat.html`) fixed the two states that didn't read: MLUVÍ
  (speaking) is now a clear open-mouth "O"; MYSLÍ (thinking) has up-looking 2×2
  eyes + a real thought bubble. Every state leads with a readable 2×2 eye pair,
  then a distinct mouth (smile · neutral+bubble · open-O · gentle frown · big
  grin). Each state also has a `blink` frame. **These maps supersede the current
  `HonzaOrb.tsx` maps for the Hmat designs** — but Classic keeps its original maps
  (byte-for-byte). So the orb component must take the map set as design-dependent
  input, or select maps by active design.

### 4.4 Icons — the system kit
- Custom hardware icon set (see `IC` in `round4-hmat.html`): geometric, square-cap,
  **embossed** on the material (white-below / faint-dark-above drop-shadow),
  inheriting `currentColor` → the mood accent. Heavier strokes, pixel construction
  where it reads (**Home** carries a 2×2 dot-matrix window; **Chat** has 3 square
  dots). **Hovor is a phone handset, not a mic** — the mic glyph is only the
  in-call mute control. Build once (P4), used by all designs, each glyph
  `aria-hidden` and paired with a real label.

### 4.5 Type & Czech (fixes F0)
- **Display/chrome/numerals:** Geist Pixel **Square** (same visual language as the
  orb). **Czech body copy + corrections:** Geist Sans / Geist Mono — full diacritic
  coverage, so `ě š č ř ž ů ď ť ň` never fall back mid-word. Pixel is **display-only**
  by default; the Lab exposes both axes so Harish can try pixel-as-body and see it
  fail on his own. **Warn in the Lab UI** when a display face is chosen for body.
- Every specimen, mockup, empty and error state uses **real Czech with the full
  diacritic set** (e.g. *"Těší mě! Čeština je krásná řeč — ďábelsky těžká, ale
  růžová."*). No lorem, no English placeholders — they hide the F0 bug.

### 4.6 Mood — felt everywhere, no debug pill
`mood → { background, accent, energy, caption }`. On Hmat, energy drives the
channel glow, orb glow/motion, and press feel. **idle and excited share the accent
hue but must be obviously distinguishable in a screenshot** via energy (dim vs
bright channel, calm vs lively orb). Accent hues unchanged.

---

## 5. Primitives before features — the spine (P0 is already done)

Build order is non-negotiable. A later-phase feature attempted before its
primitive exists is a build error, not initiative.

- **P0 — exploration corpus: ✅ DONE.** Rounds 1–4 in `design-lab/`. Do not redo it.
- **P1 — token contract + theme runtime.** `data-design` on `<html>` selects a
  token block in CSS. `:root` holds **Classic** so Classic renders with no
  attribute set — on the server, JS off, before any script. Designs:
  `classic`, `hmat-metal`, `hmat-ceramic`. Fonts are a **separate axis**
  (`--font-display`, `--font-body`). Persisted store (`localStorage`) + a
  **pre-paint inline script in `<head>`** that validates the saved value against
  the registry and applies it before first paint (falls back to Classic in a
  `try/catch`; never writes an unvalidated value into the DOM). Tailwind:
  `font-sans → var(--font-body)`, `font-display → var(--font-display)`,
  `rounded-card → var(--radius-card)`. ⚠️ Tailwind caches compiled CSS — after
  editing `tailwind.config.ts`, clear `node_modules/.cache` and restart dev;
  verify the actual rule via CSSOM, not by eye.
- **P2 — mood expression engine.** One module: `mood + design → expression`. Every
  surface reads it; no screen computes its own mood styling. This is what makes
  idle-vs-excited perceptible and the debug pill redundant.
- **P3 — behaviour/presentation split.** `useHomeScreen` / `useChatScreen` /
  `useCallScreen` (+ settings gating) own hydration gating (incl. the theme store —
  or Home flashes Classic on cold load), redirects, opener kick-off, actions. A
  design is then pure presentation. Refactor **Classic** onto these hooks without
  changing a pixel of its markup.
- **P4 — system kit.** The icon set (§4.4) + the type scale. Built once, used by
  all designs.

Fonts to install (P1): `npm i geist`; load Share Tech Mono (Classic) + Geist Sans
+ Geist Mono + the five Geist Pixel variants (Square/Grid/Circle/Line/Triangle)
via `next/font`. `geist@1.7.2` exports `geist/font/pixel` →
`GeistPixelSquare|Grid|Circle|Line|Triangle`; all carry the full Czech set.

---

## 6. Phased plan — each gate walked **in a browser**, never reasoned

`CLAUDE.md`: *"Gates are verified in the running app, not reasoned about. 'Should
work' isn't done."* Report each item as **REAL** (works end-to-end), **STUB**
(renders, nothing behind it), or **PARTIAL** (structure exists, core logic
missing). "In progress" is not a status.

### Phase 0 — base + orientation
Gate 0 (§0.2) prints all five OK; dev boots; you signed in; you saw `/call`
render; you can state what `MoodCycler` is and why it must not ship.

### Phase 1 — P1: token contract + theme runtime
Registry (`classic`, `hmat-metal`, `hmat-ceramic`; font ids; per-design font
defaults), token CSS blocks, persisted store, pre-paint script, `DesignRoot`,
Tailwind wiring, fonts installed.
**Gate:** (1) `document.documentElement` shows the right `data-design` + resolved
`--font-display`/`--font-body`. (2) Via CSSOM: `.font-sans` resolves to
`var(--font-body)`. (3) Set a non-Classic design in `localStorage`, hard reload →
**no flash of Classic**. (4) Corrupt the `localStorage` blob → app still loads, as
Classic. (5) `npm run build` passes and prints `ƒ Middleware`.

### Phase 2 — P2: mood expression engine
**Gate:** (1) Drive each of the 5 moods; background + `--accent` + orb + channel
move together on every surface. (2) **idle and excited are obviously
distinguishable in a screenshot**, accent hues unchanged. (3) `MoodCycler` still
dev-gated and **not visible** in a normal `npm run dev`.

### Phase 3 — P3/P4: behaviour hooks + system kit
Hooks + icon set + type scale; refactor Classic onto the hooks.
**Gate:** (1) Classic renders **identically** to the base branch — screenshot-
compare Home/Chat/Call/Settings before/after. (2) Classic behaviour unchanged:
opener fires, reply sends, call works. (3) Hooks gate on theme hydration.

### Phase 4 — Hmat across the four nav surfaces (Metal + Ceramic)
Home, Chat, Call, Settings chrome, in Hmat — both material variants via tokens.
Match `round4-hmat.html`: machined recess, deep keys, lit channel, floating dock,
re-authored orb, custom icons.
**Gate (walked in browser at 430px):** (1) All four tabs render with no horizontal
scroll and no overlap with the fixed dock; **nothing overflows the frame** (the
round-4 layout discipline). (2) Nav has 4 destinations, scannable via the new
icons, marks the active tab, Hovor = phone. (3) Honza is character-first on every
surface; his face reads the shared mood store with the round-4 maps. (4) Czech
renders in a body face with full diacritics — no mid-word font change. (5) Send a
**real** message, get a **real** reply, in Hmat. (6) `/call` is designed, not a
leftover. (7) Empty/loading/error states are styled. (8) Toggle Metal↔Ceramic —
only the surface changes; layout/behaviour identical.

### Phase 5 — pre-app surfaces in Hmat
`/welcome`, `/signin`, `/onboarding`.
**Gate:** Sign out → `/welcome` → sign in → onboarding → Home, no unstyled screen,
no dead end, in Hmat (both variants).

### Phase 6 — the Design Lab (Settings)
Design picker with live swatches (Classic / Hmat Metal / Hmat Ceramic); independent
display/body font selects; reset-to-design-default; a **live Czech specimen**
(`"Těší mě! Čeština je krásná řeč — ďábelsky těžká, ale růžová."`).
**Gate:** (1) Switching design restyles the Settings page **you are standing on**.
(2) Switching fonts updates the specimen live; warns on a display-face-as-body
pick. (3) Choosing **Classic** returns the shipped app exactly. (4) Reload →
choice persisted, **no flash**. (5) Reachable by a real user with dev tools **off**.

### Phase 7 — reconcile
Update `TASKS.md`, `BUILD_SPEC_STATUS.md`, `MEMORY.md`, and `DESIGN.md` (the design
system is now plural — Classic + Hmat Metal + Hmat Ceramic; say so there, and fold
in the Hmat spec + the re-authored orb maps + the icon set). Record what broke and
what you decided.
**Gate:** `npm run lint` + `npm run build` pass; docs match reality.

---

## 7. Operating block

Work the phases in order. **Do not stop between phases to ask permission** — the
design decision is already made; every choice you need is here or in
`round4-hmat.html`. Resolve genuine ambiguity toward the outcome narrative
(`../mega-prompt-honza-redesign.md` §1) and the round-4 reference.

Do not report a phase complete until its gate passes **in a browser**. "It
compiles" and "should work" are not gates. If a gate can't be walked (e.g. mic/
audio can't be verified headlessly — see `DEPLOY.md` §5), say so plainly and leave
it flagged 🟡 with honest gap text.

Non-negotiables, one more time: **Classic byte-for-byte · orb stays the dot matrix
(round-4 maps for Hmat, original maps for Classic) · 4 nav tabs incl. /call · no
gamification / no fake numbers · accent hues locked, fix idle-vs-excited with
energy · debug pill never ships · no secrets in client, no new env vars · all
model/TTS calls behind Route Handlers.**

Keep working until the Definition of Done in `../mega-prompt-honza-redesign.md`
§2.7 is true — plus: a user can open Settings → Design Lab and switch between
**Classic**, **Hmat Metal**, and **Hmat Ceramic** live, with the choice surviving
reload and no flash of the wrong design.
