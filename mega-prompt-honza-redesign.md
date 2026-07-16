# MEGA PROMPT — Honza design system rebuild + Design Lab

**Read this entire document before running a single command.** You have no prior
context on this project and you will not get to ask me questions mid-build.
Everything you need is here. Where something is genuinely ambiguous, resolve it
toward the outcome narrative in §1.

This document supersedes any assumption you might form from a quick skim of the
repo. In particular: **the `main` branch is not the current state of this app.**

---

## 0. START HERE — fetch first, and why a previous attempt failed

### 0.1 `git fetch` before you form a single belief about this repo.

```bash
git fetch --all --prune
git checkout main
git pull                      # main must be at 2af8e6f or later
git checkout -b design/<your-branch-name>
```

**This is the single most important instruction in this document.** The previous
attempt failed at the first step: it trusted the stale `main` in its context
snapshot (`76b6ccb`), never fetched, and therefore built an entire design system
for an app that was **two commits out of date**. Everything downstream was wrong.

`main` **already contains** BUILD_SPEC Phase 8 (voice), merged as PR #8, commit
`2af8e6f`. If your `git log main` doesn't show *"BUILD_SPEC Phase 8: voice calls
(/call + server-side TTS + kind:'call' transcripts) — plus ship prep (#8)"*, **you
have not fetched.** Stop and fetch.

`claude/ship-prep-deploy-smtp` is the (already-merged) source branch for that PR.
**Do not branch from it.** Branch from an up-to-date `main`.

What Phase 8 put on `main`, which your design must account for:

| On `main` as of `2af8e6f` | Why it matters to you |
|---|---|
| `src/app/call/page.tsx` + `src/app/call/CallClient.tsx` (341 lines) | **A whole primary surface.** Voice calls with Honza. |
| `src/app/api/tts/route.ts`, `src/lib/server/tts.ts` (228 lines) | Server-side ElevenLabs TTS. |
| `src/hooks/useSpeechRecognition.ts` (138 lines) | Mic input. |
| `src/components/layout/BottomNav.tsx` — **a 4th tab: `Call`** | Every nav you design has **4 destinations, not 3**. |
| `kind:'call'` transcripts in `useChatStore` / `types` | Chat and Call share a thread model. |
| `HonzaOrb.tsx` — the rAF crossfade fix | Already fixed. Do not "discover" it again. |

### 0.2 Verify the base before you write anything

**Gate 0 — run this first and confirm every line prints:**

```bash
git log --oneline -1 main | grep -q "#8" && echo "OK main has Phase 8"
test -f src/app/call/CallClient.tsx && echo "OK call client"
test -f src/app/api/tts/route.ts     && echo "OK tts route"
grep -q "ROUTES.call" src/components/layout/BottomNav.tsx && echo "OK 4-tab nav"
! grep -qE '^[[:space:]]*window\.requestAnimationFrame\(' src/components/honza/HonzaOrb.tsx \
  && echo "OK orb rAF fix present"
```

All five must print. This exact block was run against `main @ 2af8e6f` on
2026-07-16 and all five passed — so if one fails for you, the difference is your
checkout, not the repo.

(Note the rAF check is deliberately `^\s*window.requestAnimationFrame(` and not a
bare `grep -c requestAnimationFrame`. The latter returns 1 — it matches the
*comment* that explains the fix. A gate that greps for a word rather than a call
site is a gate that lies to you.)

If any line fails, **stop and fetch**. Do not proceed, do not "work around it,"
and above all **do not delete the failing check**.

### 0.3 The previous attempt failed for four specific reasons. Do not repeat them.

A prior session produced work that was thrown away in full. The failures, so you
can actively avoid them:

1. **It never ran `git fetch`.** It trusted the stale `main` in its context
   snapshot and designed a 3-tab app for a 4-tab product. When TypeScript errored
   that `src/app/call/page.js` was missing, it dismissed this as a "stale
   artifact" and **deleted the `.next/types` directory that was reporting it** —
   destroying the one piece of evidence that would have caught the mistake in the
   first ten minutes. **When the compiler tells you a route exists that you can't
   see, believe the compiler and go looking.** A context snapshot of git state is
   a photograph, not a live feed.
2. **It installed the taste skills and never invoked them.** It ran
   `npx skills add`, read ~80 lines of one SKILL.md, then generated three
   directions from its own head in a single pass. Result: narrow, templated,
   first-idea work. §3.P0 and §4 Phase 1 exist to make this structurally
   impossible.
3. **It ignored the repo's own memory.** `MEMORY.md` said *"voice is BUILT"* and
   *"check MERGED vs CLOSED before trusting a past PR."* Both were read and
   ignored.
4. **It amplified the exact thing I complained about.** I pointed at a mystery
   toggle in the top of the screen and said I don't know what it does. It's
   `MoodCycler`, a dev-only debug harness. The previous attempt *kept* it, turned
   its dev flag **on**, and added a JS handle to it. See §2.4 — that pill is a
   symptom, and the redesign's job is to cure the disease.

---

## 1. Outcome narrative — the day I want

*(Written as me, Harish. This is what you resolve ambiguity against at hour six.
Every screen named here appears in the phases below.)*

It's 7:40am and I'm on the tram. I open Honza — installed on my home screen, no
browser chrome — and before I've done anything, he's already written to me. Not a
notification I have to go fetch: he's *there*, waiting, and the first thing I see
is his face and the fact that he opened with something. Today it's a question
about whether I actually went to that café I mentioned last week. In Czech. He
remembered.

I don't feel a lesson starting. I feel a friend checking in. I type back in Czech,
badly, and he takes the ball — he fixes what I broke without making it a red
buzzer moment, and then he keeps talking, because the point is the conversation,
not the correction. When I get something genuinely right, I can *feel* the room
change before I've read a word — the whole screen shifts. When I make a joke and
he plays along, I actually chuckle on the tram like an idiot.

Later, at lunch, I don't want to type. I hit Call and we just talk. Same Honza,
same memory, same face — a different way in. It's the same relationship, not a
different app.

In the evening I'm in Settings, and this is the part nobody builds: I open the
**Design Lab** and I can *switch the entire app*. Different design language,
different type, live, on the screen I'm standing on. The version we shipped is
still in there, untouched, so I can flip back and see exactly what changed and
decide with my eyes instead of my imagination. This is a real feature for me — I
am the one deciding what this app becomes, and I need to see the options side by
side, not read about them.

What I want, in one line: **it should make me feel happy and thoughtful, like I'm
sparring with a friend who's genuinely glad to hear from me — and it should make
me fall in love with the language.** Not a cartoon owl guilting me about streaks.

---

## 2. Scope fence

### 2.1 Persona
One. Me — Harish. An adult learning Czech, using this daily, on a phone. There is
no teacher persona, no admin, no second user. Do not build for anyone else.

### 2.2 Navigation skeleton (this is the truth on the base branch)

**Signed-in app — 4 tabs, all four get designed:**
- `/` — Home. Honza has already written to you.
- `/chat` — the typed conversation.
- `/call` — the voice conversation.
- `/settings` — profile, context, **and the Design Lab**.

**Pre-app surfaces — also in scope:**
- `/welcome` — signed-out front door.
- `/signin` — email + password.
- `/onboarding` — level + topics.

### 2.3 Explicitly OUT of scope

| Out | Why |
|---|---|
| **Structured corrections / a "correction UI"** | The engine returns unstructured prose. There is no correction field to style. Detecting corrections by regex is guessing, and a *wrong* correction highlight teaches a learner the wrong thing. This needs an engine contract change first — that is a separate piece of work. **Do not fake it.** |
| **Scheduling + social features** | Hard rule in `CLAUDE.md`. Not this product. |
| **Streaks, XP, leagues, badges, gamification** | See §2.5. |
| **Changing the conversation engine, prompts, or auth** | You are doing design. `conversation-engine.ts`, the Supabase layer, and `/api/*` are not yours to rewrite. |
| **Branch/PR housekeeping** | Phase 8 is already merged (PR #8, `2af8e6f`). Don't merge, rebase, or delete anyone's branches. Open one PR for your design work; that's all. |
| **New model providers, new secrets, new env vars** | The env is settled. |
| **Custom SMTP / Vercel deploy** | Pre-launch tasks, unrelated. |

### 2.4 The mood system, and the pill

The single best idea in this app is: **Honza has a mood, and his mood colours the
entire screen.** `useMoodStore` → the shell sets the background tint and
`--accent`, so borders, buttons and links all recolour as one coherent mood.

Right now that system is only *legible* in `MoodCycler` — a dev-only debug pill
floating at the top of the screen that cycles I/T/S/O/E. I don't know what it is,
because it isn't a feature; it's a QA harness gated behind
`NEXT_PUBLIC_HONZA_DEV_TOOLS=1`.

**Your job is not to keep the pill. Your job is to make the real UI express what
the pill exposes**, so the debug harness becomes redundant. Requirements:

- The mood must be **felt** on every surface, without a debug control.
- `MoodCycler` stays exactly as it is — dev-gated, off by default. **Do not turn
  its flag on. Do not style it. Do not surface it to me. Do not add global JS
  handles to it.**
- Known defect to fix in the design, not the debug tool: **`idle` and `excited`
  ship with an identical palette** (`#FFF4EE` / `#E8432D`). The two states I most
  need to tell apart — "waiting" vs "you nailed it" — are currently separated
  only by a 1.03-vs-1.04 scale bump on the face. Nobody can perceive that. Fix it
  **without changing the accent hues** (see §2.6).

### 2.5 No Duolingo. This is a hard aesthetic fence.

I attached reference screenshots. **They are reference for *energy*, not
aesthetics** — specifically: iconography, clearly labelled sections, and the fact
that things *pop*. Everything else about them is wrong for this product.

Banned outright:
- Mascots, caricatures, 3D characters, illustrated creatures, anything with a
  face other than **Honza's existing dot-matrix orb**.
- Streak flames, XP counters, gem/coin economies, leaderboards, league tables,
  "Day 10/32" challenge cards, confetti.
- Bubbly rounded-everything "friendly app" styling.
- AI-default slop: purple gradients, centered hero over dark mesh, three equal
  feature cards, glassmorphism on everything.

Honza is **hardware, not a cartoon**: Nothing-OS dot matrix, a square grid of
rounded pixels. He is a presence, not a pet. Keep that.

### 2.6 Colour constraint

Keep the existing accent hues. They are the product's identity:

| State | Background tint | Accent |
|---|---|---|
| idle | `#FFF4EE` | `#E8432D` |
| thinking | `#EEF2FF` | `#3A7BD5` |
| speaking | `#EEFFEE` | `#2E7D32` |
| oops | `#FFF0F5` | `#C2185B` |
| excited | `#FFF4EE` | `#E8432D` |

Canonical canvas: `#F5F2EE`.

You may **add expression channels** (a per-mood energy/intensity value driving
glow, motion amplitude, density, type weight — anything that isn't hue) and you
may shift *backgrounds* within the same family. You may not re-hue the accents.
That's how you fix idle-vs-excited without breaking the identity.

### 2.7 Definition of done (plain words)

A stranger — or me — opens the finished app on a phone and can:
1. Land on `/welcome` signed out, sign in, complete onboarding, and reach Home
   without hitting a dead end or an unstyled screen.
2. Read a message Honza opened with, reply in Czech, and get a reply — with every
   Czech diacritic (`ě š č ř ž ů ď ť ň`) rendering in **one consistent typeface**.
3. Move between all **four** tabs. Every tab is designed. None is a stub.
4. Feel Honza's mood change the whole screen, with **no debug pill on screen**.
5. Open Settings → Design Lab, switch design and switch fonts, and watch the app
   restyle live — including the screen they're standing on.
6. Switch to **Classic** and get back the exact app that shipped.
7. Reload, and their design choice survives — with no flash of the wrong design.

---

## 3. Primitives before features — the spine

**Build order is non-negotiable. If a later-phase feature is attempted before its
primitive exists, that is a build error, not initiative.**

Four primitives. Everything else is downstream of them.

### P0 — The exploration corpus (yes, this is a primitive)

You do not get to design from your own head in one pass. That is precisely how the
last attempt failed. Before any app code exists, you must produce a **wide,
cheap, divergent set of directions** and I must choose from it.

**You must actually invoke the installed skills.** They are installed in
`.agents/skills/` (symlinked to `.claude/skills/`). Reading a SKILL.md is not
invoking it. At minimum:

- `design-taste-frontend` — anti-slop, audit-first, brief inference, the three
  dials (DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY). It requires you to
  state a one-line **Design Read** before generating anything. Do that, out loud.
- `frontend-design` — production-grade interface craft.
- `high-end-visual-design` — the spacing/shadow/type discipline that separates
  expensive from cheap.
- Consult, and reject with a reason if they don't fit: `minimalist-ui`,
  `industrial-brutalist-ui`, `stitch-design-taste`.

This primitive's output is an artifact, not a vibe. See Phase 1.

### P1 — The token contract + theme runtime

A design is **a set of tokens plus a component tree**, never inline hex. Required:

- `data-design` on `<html>` selects a token block in CSS. `:root` holds Classic's
  values so Classic is what renders with no attribute set at all — on the server,
  with JS off, and before any script runs.
- Fonts are a **separate axis** from design: `--font-display` and `--font-body`
  set independently, so "does Geist Pixel work as a body face for Czech?" is a
  question I answer by *looking*, not arguing.
- A persisted store (`localStorage`) + **a pre-paint inline script in `<head>`**
  that applies the saved design before first paint. Without it, every cold load
  flashes Classic. The script must validate against the design/font registry —
  never write an unvalidated `localStorage` value into the DOM — and must
  fall back to Classic inside a `try/catch` rather than white-screening over a
  theme preference.
- Tailwind resolves `font-sans` → `var(--font-body)`, `font-display` →
  `var(--font-display)`, `rounded-card` → `var(--radius-card)`.

⚠️ **Known trap:** Tailwind caches compiled CSS. After editing `tailwind.config.ts`,
`.font-sans` can keep serving the *old* value even through a `.next` wipe. If a
token change doesn't appear, clear `node_modules/.cache` and restart dev before
you go hunting for a phantom bug. Verify the actual rule via CSSOM, not by eye.

### P2 — The mood expression engine

One module: `mood + design → { background, accent, energy, motion, caption }`.
Every surface reads it. No screen computes its own mood styling. This is what
makes §2.4 curable and what makes idle-vs-excited perceptible.

### P3 — Behaviour/presentation split

N designs × M screens must not mean N×M copies of the logic. Extract each
screen's behaviour into a hook (`useHomeScreen`, `useChatScreen`,
`useCallScreen`) that owns hydration gating, redirects, opener kick-off and
actions. A design is then **pure presentation**. A bug fixed once is fixed in
every design.

Hydration gating must include the theme store, or Home flashes Classic's layout
on every cold load.

### P4 — The system kit

The icon set (the app currently ships **one** icon — the send arrow — so nothing
is scannable) and the type scale. Icons on a consistent grid, in the hardware
voice (square caps, no soft humanist lucide curves), inheriting `currentColor`,
`aria-hidden`, always paired with a real label. Built once, used by all designs.

---

## 4. Phased dependency graph

Each phase ends with a **verification gate**. A gate is passed **in the running
app in a browser**, never by reasoning. `CLAUDE.md`: *"Gates are verified in the
running app, not reasoned about. 'Should work' isn't done."*

---

### Phase 0 — Base + orientation
**Depends on:** nothing.
**Build:** Nothing. Read `CLAUDE.md`, `DESIGN.md`, `DESIGN_AUDIT.md`,
`BUILD_SPEC_STATUS.md`, `TASKS.md`, `MEMORY.md`. Branch per §0.1.
**Gate:**
1. All four checks in §0.2 print OK.
2. `npm run dev` boots; you can sign in via `node scripts/dev-signin.mjs <email>`
   (sends no email; prints an `/auth/callback` URL).
3. You have loaded `/call` in a browser and seen it render.
4. You can state, in one line, what `MoodCycler` is and why it must not ship.

---

### Phase 1 — P0: divergent exploration, and I choose
**Depends on:** Phase 0.
**Build:** A standalone **exploration gallery** — a single self-contained HTML
page (not wired into the app; a scratch artifact) showing **at least 8 distinct
directions**, each rendered as a **430px-wide Home + Chat pair** with real Czech
copy and Honza's real dot-matrix orb.

Rules for this phase:
- **Invoke the skills first.** State your Design Read and your three dial values
  before you draw anything.
- 8 directions means **8 genuinely different theories of the product**, not one
  idea in 8 colourways. Vary the actual thinking: what is Honza *here* — an
  instrument? a correspondent? a room? an opponent? a signal? a page? Push some
  past your comfort zone; I'd rather reject three than see three safe ones.
- Every direction must obey §2.5 (no mascots/gamification) and §2.6 (accent hues
  fixed).
- For each: a name, the **one feeling** it's built around, and one sentence on
  what it does that the others don't.
- **No app code is written in this phase.**

**Gate:**
1. The gallery opens in a browser at 430px and renders 8+ directions.
2. Each shows real Czech with correct diacritics and the real orb.
3. Each names its feeling and its differentiator.
4. **I have picked the 2–3 that get built. Stop and wait for my answer.** This is
   the one place you stop. Do not proceed to Phase 2 on your own judgement.

---

### Phase 2 — P1: token contract + theme runtime
**Depends on:** Phase 1 (you know how many designs and roughly what they need).
**Build:** Registry (design ids, font ids, per-design font defaults), token CSS
blocks, persisted theme store, pre-paint script, `DesignRoot`, Tailwind wiring.
Fonts: `npm i geist` and load Share Tech Mono + Geist Sans + Geist Mono + the
five Geist Pixel variants (Square / Grid / Circle / Line / Triangle).
**Gate:**
1. `document.documentElement` shows the right `data-design` and resolved
   `--font-display` / `--font-body`.
2. Via CSSOM (not by eye): `.font-sans` resolves to `var(--font-body)`.
3. Set a non-Classic design in `localStorage`, hard reload → **no flash of
   Classic**.
4. Corrupt the `localStorage` blob to garbage → app still loads, as Classic.
5. `npm run build` passes and prints `ƒ Middleware`.

---

### Phase 3 — P2: mood expression engine
**Depends on:** Phase 2.
**Build:** The mood→expression module, consumed by the shell.
**Gate:**
1. Drive each of the 5 moods and confirm background + `--accent` + orb move
   together on every surface.
2. **`idle` and `excited` are now obviously distinguishable in a screenshot** —
   with accent hues unchanged per §2.6.
3. `MoodCycler` is still dev-gated and **not visible** in a normal `npm run dev`.

---

### Phase 4 — P3/P4: behaviour hooks + system kit
**Depends on:** Phase 2.
**Build:** `useHomeScreen` / `useChatScreen` / `useCallScreen` (+ settings
gating), the icon set, the type scale. Refactor **Classic** onto the hooks
*without changing a pixel of its markup*.
**Gate:**
1. Classic still renders identically to the base branch — screenshot-compare
   Home, Chat, Call, Settings before/after.
2. Classic's behaviour is unchanged: opener fires, reply sends, call works.
3. Hooks include theme hydration in their gate.

---

### Phase 5..N — one phase per chosen design
**Depends on:** Phases 2–4.
For **each** design I picked, one phase covering **all four nav surfaces**:
Home, Chat, Call, Settings chrome.
**Gate (per design):**
1. All four tabs render at 430px with no horizontal scroll and no overlap with
   the fixed nav.
2. Nav has **4 destinations**, is scannable via icons, and marks the active tab.
3. Honza is present and character-first on every surface; his face reads the
   shared mood store.
4. Czech renders in a body face with full diacritic coverage — no mid-word font
   changes.
5. Send a real message and receive a real reply, in this design.
6. Open `/call` and confirm the call surface is designed, not a leftover.
7. Empty, loading, and error states are all styled — no bare "Loading…".

---

### Phase N+1 — pre-app surfaces
**Depends on:** Phase 5..N.
**Build:** `/welcome`, `/signin`, `/onboarding` in each chosen design.
**Gate:** Sign out → `/welcome` → sign in → onboarding → Home, with no unstyled
screen and no dead end, in every design.

---

### Phase N+2 — the Design Lab
**Depends on:** all of the above.
**Build:** The Lab, in Settings. Design picker with live swatches; independent
display/body font selects; reset-to-design-default; a **live Czech specimen**
(see §5.3).
**Gate:**
1. Switching design restyles the Settings page **you are standing on**.
2. Switching fonts updates the specimen live.
3. Choosing **Classic** returns the shipped app exactly.
4. Reload → choice persisted, no flash.
5. The Lab is reachable by a real user with dev tools **off**.

---

### Phase N+3 — reconcile
**Build:** Update `TASKS.md`, `BUILD_SPEC_STATUS.md`, `MEMORY.md`, `DESIGN.md`
(DESIGN.md is the design system's source of truth — if the Lab makes it plural,
say so there). Record what broke and what you decided.
**Gate:** `npm run lint` + `npm run build` pass; docs match reality.

---

## 5. Data & content doctrine

### 5.1 No hardcoded design values in components
Colours, radii, fonts come from tokens. If you're typing a hex into a `.tsx`,
you're creating the next migration.

### 5.2 No invented data. Ever.
If you render a number, it must come from real state. The previous attempt was
tempted by a "rally counter"; the only honest version of that counts actual
messages in the real store. **Do not render a streak, an XP total, a "day 4/30",
or a progress percentage that isn't computed from real data.** If the data
doesn't exist, the UI element doesn't exist. This is `CLAUDE.md`'s integration
doctrine — one honest seam, no faked push notifications.

### 5.3 Czech is the content, and it is load-bearing
Every specimen, mockup, and empty state uses **real Czech with the full diacritic
set**, e.g. *"Těší mě! Čeština je krásná řeč — ďábelsky těžká, ale růžová."*
Lorem ipsum and English placeholders will hide the exact bug described in §6.

---

## 6. The typography finding you must not re-derive (it's already verified)

`DESIGN_AUDIT.md` is on your branch as an untracked file. Its headline finding is
**verified, not a theory** — treat it as given:

> `layout.tsx` loads `Share_Tech_Mono({ subsets: ["latin"] })`. Share Tech Mono
> **publishes only a `latin` subset** — there is no `latin-ext` to opt into. Its
> unicode-range is `U+0000-00FF` plus strays. Czech's `ě š č ř ž ů ď ť ň` live in
> **Latin Extended-A (U+0100–017F)**, outside it.
>
> **9 of the 15 accented Czech characters silently fall back** to the system
> monospace. *"Těší mě. Čeština je krásná řeč."* renders in **two typefaces
> today**, mid-word.

```
ě š č ř ž ý á í é ú ů ď ť ň ó
· · · · · ý á í é ú · · · · ó     · = not in the font, falls back
```

**Implications, already decided:**
- All five Geist Pixel variants + Geist Mono + Geist Sans carry the full Czech set
  (verified with fontTools: 420 glyphs each). `geist@1.7.2`, exports
  `geist/font/pixel` → `GeistPixelSquare|Grid|Circle|Line|Triangle`.
- **Geist Pixel is a display face.** I asked for it "throughout" — build it so I
  can *try* that, but the honest default is **Pixel for display/chrome/numerals,
  Geist Mono or Sans for Czech body copy**, because at 15px `ř`/`r` and `ě`/`e`
  collapse and that's the exact detail a learner must see. The Lab exposes both
  axes so I decide by looking. Warn me in the UI when I pick a display face for
  body.
- **Geist Pixel Square is the same visual language as the dot-matrix orb.** That's
  not a coincidence to waste.
- **Classic keeps Share Tech Mono**, bug and all — it's the baseline; changing it
  makes the comparison dishonest.

---

## 7. Doc map — what to open, and when

| Doc | Protects | Open it |
|---|---|---|
| `CLAUDE.md` | The hard rules, the Definition of Done, the doc system. | Before anything. Re-read the Hard Rules before any decision that feels like a shortcut. |
| `DESIGN.md` | The visual system's source of truth (cream / dot-matrix / orb specs / motion table). | Every time you create or restyle a screen. If the Lab makes the system plural, **update this doc** — don't silently contradict it. |
| `DESIGN_AUDIT.md` | The verified findings (esp. F0 above, and the idle-vs-excited defect). | Before Phase 1. It's untracked on your branch; commit it. |
| `BUILD_SPEC_STATUS.md` | Where the project actually is. Trust it over prose. | Phase 0, and at Phase N+3. |
| `TASKS.md` | Build order + checkboxes. | Phase 0; tick items as you go. |
| `MEMORY.md` | What works, what broke, what not to revisit. **Read this. The last session didn't.** | Phase 0, and update at N+3. |
| `BUILD_SPEC.md` | The phased v1 spec. Phase 8 (voice) is what's on your base branch. | Reference only. |

---

## 8. Verifying in a browser — read this or you will chase ghosts

`MEMORY.md` records these. They cost the last session real time:

- **The browser pane's document is permanently `hidden`.** Therefore
  `requestAnimationFrame` **never fires**, and **CSS transitions never advance**.
  An element can have inline `opacity: 1` and computed `opacity: 0` forever. If
  something is invisible after a transition, check the **inline** value before
  concluding it's broken.
- **CDP clicks/keys don't reach React.** Synthesized clicks never hit the DOM.
  Probe first; drive React from JS, or seed `localStorage` and reload.
- **`setTimeout` is clamped to ~1s** in a hidden document. Don't measure at 200ms
  and conclude a timer never fired.
- **Never run `npm run build` while `next dev` is up** — it overwrites `.next` and
  strips the running dev server's CSS. Looks like a catastrophic style
  regression; it's an artifact. Restart dev.
- **Clear `localStorage` before testing DB persistence** — the local store is a
  live alternative explanation for anything that renders.
- Sign in locally with `node scripts/dev-signin.mjs <email>` — sends no email, so
  the built-in mailer's ~2/hour cap never applies.

---

## 9. Operating block

Work through the phases in order. **Stop exactly once: at the end of Phase 1, for
me to choose the directions.** Do not stop between any other phases, and do not
ask me anything else — every decision you need is in this document; when
genuinely ambiguous, resolve toward the outcome narrative in §1.

Before you write a line of app code: run Gate 0 (§0.2), and **actually invoke the
taste skills** (§3.P0) and state your Design Read out loud. If you catch yourself
generating a design direction without having invoked them, stop and start that
phase over.

Do not report a phase complete until its verification gate passes **in a browser**.
"It compiles" and "should work" are not gates. If a gate can't be walked, say so
plainly and leave it flagged with honest gap text — `CLAUDE.md` requires this.

Status vocabulary for anything you report: **REAL** (works end-to-end), **STUB**
(renders, nothing behind it), **PARTIAL** (structure exists, core logic missing).
"In progress" is not a status.

Non-negotiables, restated because they're the ones most likely to erode at hour
six:
- **Classic is preserved byte-for-byte.** It's the baseline. Refactor its
  behaviour onto shared hooks if you like; do not touch its markup or its font.
- **4 nav tabs, including `/call`.** Every design, every time.
- **No mascots, no gamification, no streaks, no fake numbers.**
- **Accent hues unchanged.** Fix idle-vs-excited with energy, not hue.
- **The debug pill does not ship, does not get styled, and does not get turned on.**
- **No secrets in client code. No new env vars. All model/TTS calls stay behind
  Route Handlers.**

Keep working until the definition of done in §2.7 is true.
