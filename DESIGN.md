# Honza — design system

> **The design system is now plural (2026-07-16).** There are **three selectable
> designs**, switched live in Settings → Design Lab: **Classic** (the original,
> documented in the body of this file), **Hmat Metal**, and **Hmat Ceramic**.
> Classic is preserved **byte-for-byte** — it keeps Share Tech Mono and the F0
> font bug on purpose, as the baseline the Lab compares against. The Hmat spec,
> the re-authored orb maps, and the icon set are in **§ Design Lab** at the end
> of this file. Everything above that section describes **Classic**.

## Identity

The app is **Honza**. The character **is** the app: Nothing OS dot matrix meets a friendly Czech tutor. Every screen leads with the character. He is never treated as a small decorative icon on primary surfaces.

---

## Background

**Global canvas:** warm cream / off-white `#F5F2EE`. Not pure white, not cold grey. Cards and bubbles sit on this base.

**Per emotional state**, the whole screen shifts mood using a tinted surface plus accent (see Colors). Background tints are applied app-wide when Honza’s state changes.

---

## Typography

- **Font:** [Share Tech Mono](https://fonts.google.com/specimen/Share+Tech+Mono) (Google Fonts), loaded app-wide.
- **All UI text** uses this monospace dot-matrix voice. **No Inter** (or other rounded humanist UI fonts) for product chrome.
- **Letter-spacing:** `0.2em` on general monospace labels; section labels use **`0.25em`**.
- **Section labels:** uppercase, muted, prefixed with `//` as if code comments (e.g. `// TODAY'S LESSON`, `// REPLY NOW`, `// SETTINGS`).
- **Czech** in chat bubbles and teaching copy; **English** for navigation, settings, and meta labels where clarity for the learner is the goal (adjust per screen copy deck).

---

## Colors (emotional states)

Each state defines a **tinted background** and **accent**. The accent drives borders, primary buttons, Honza’s face pixels, links, and the reply composer border/send control. The app should feel like one coherent mood per state.

| State    | Background tint | Accent   | When |
|----------|------------------|----------|------|
| **idle** | `#FFF4EE`        | `#E8432D` | Waiting, default happy presence |
| **thinking** | `#EEF2FF`    | `#3A7BD5` | Generating a reply |
| **speaking** | `#EEFFEE`    | `#2E7D32` | Just sent a message (brief beat) |
| **oops** | `#FFF0F5`        | `#C2185B` | Grammar slip — gentle, not punitive |
| **excited** | `#FFF4EE`     | `#E8432D` | Perfect reply — same palette as idle, bigger expression |

Canonical cream behind everything: **`#F5F2EE`**. State backgrounds are overlays or section tints on top of that mental model.

---

## Honza character (HonzaOrb)

- **Shape:** square **dot matrix** face — not a circle, not a soft blob.
- **Pixels:** small **rounded squares** (`<rect>` with small `rx`, ~1.5px at hero scale).
- **Matrix:** faint background grid of dots so the inactive matrix reads as hardware / Nothing-like.
- **Features:** built from dot combinations:
  - Eyes: **2×2** or **3×2** blocks.
  - Smile: arc of individual squares; **frown:** inverted arc.
  - **Open mouth:** solid rectangle of squares.
  - **Thought:** floating squares top-right.
  - **Tears:** vertical column of squares.
  - **Sound:** squares to the right of the face.
  - **Cheeks:** single faint square each side (stronger in **excited**).
- **Sizes:**
  - **Hero (home / lesson lead):** minimum **200×200** px.
  - **Avatar (chat header / inline):** **64×64** px.

---

## Character states (product mapping)

| Prop value   | Meaning |
|--------------|---------|
| `idle`       | Honza is waiting. Slow, calm pulse. |
| `thinking` | Generating. Faster opacity pulse. |
| `speaking`   | Just spoke. Short one-shot scale emphasis. |
| `oops`       | User grammar issue. Soft, sympathetic face. |
| `excited`    | Great answer. Wider smile, cheek emphasis. |

---

## Motion

All motion respects **`prefers-reduced-motion`**: prefer static or near-static poses; disable infinite loops where they would distract.

| State     | Motion (when reduced motion is off) |
|-----------|-------------------------------------|
| `idle`    | Scale `1 → 1.03 → 1`, **3s** `ease-in-out`, infinite |
| `thinking` | Opacity **0.7 → 1 → 0.7**, **0.8s** infinite |
| `speaking` | Scale **1 → 1.06 → 1**, **0.4s** `ease-out`, **once** per entry |
| `oops`    | Very subtle idle-like breathing (low amplitude) or static |
| `excited` | Same family as idle with slightly stronger scale (e.g. up to **1.04**) |

**State change:** ~**200ms** crossfade (or fade) between face expressions so swaps do not pop.

---

## Cards and layout

- **Cards:** white (`#FFFFFF` or near-white) on cream; **`border-radius: 16px`**; border **`1px solid rgba(0, 0, 0, 0.07)`**.
- **Section labels:** monospace, **~8px** effective size (or scale with rem), **`letter-spacing: 0.25em`**, muted color, **`//` prefix**.
- **Max width:** ~**430px** centered “phone stage” on large viewports.
- **Bottom navigation:** monospace tab labels; **dot indicator** (or equivalent) for the active tab — no bubbly pill primary nav.

---

## Chat

- **Honza bubble:** left-aligned, **white card**, body text in **accent** (or accent-tinted) monospace as appropriate.
- **User bubble:** right-aligned, **accent fill**, **white** text.
- **Timestamps:** monospace, muted, **~9px**.
- **Highlights** inside Czech copy (e.g. key phrase) may use accent at full strength.

---

## Reply composer

- **Placeholder:** `REPLY IN CZECH_` with a **blinking underscore** cursor (monospace).
- **Field:** pill shape, **accent-colored** border (2px class of weight is fine).
- **Send:** filled **circle**, **accent** fill, icon in white.

---

## Implementation notes

- Export **`HONZA_STATE_COLORS`** from `HonzaOrb` (or a tiny `honza/theme` module if split later) so screens can set CSS variables or Tailwind arbitrary values for full-screen mood.
- Keep tokens in sync with this document when adding new states or marketing surfaces.

---

## On-disk references

Design screenshots and exports:

`/Users/harishnagarajan/Documents/Cursor/Honza/Design Reference`

Use this folder for reviews so Figma / exports stay traceable.

---

# Design Lab (multiple designs)

Since 2026-07-16 the app ships **three designs**, switchable live in **Settings →
Design Lab**. Everything above is **Classic**. This section documents the
architecture and the **Hmat** design (Metal + Ceramic).

## The three designs

| Design | Family | Surface | Display font | Body font |
|---|---|---|---|---|
| **Classic** | classic | cream, flat cards | Share Tech Mono | Share Tech Mono (F0 bug kept on purpose) |
| **Hmat Metal** | hmat | brushed cream-metal, visible grain | Geist Pixel Square | Geist Sans |
| **Hmat Ceramic** | hmat | warm matte ceramic, grain off | Geist Pixel Square | Geist Sans |

Metal and Ceramic are the **same layout and component tree** — they differ only
in a token block (material gradient, grain, warmth). Do not fork components for
them.

## Token contract + theme runtime

- `data-design` on `<html>` selects a token block in `globals.css`. `:root` holds
  **Classic**, so Classic renders with **no attribute** — on the server, JS off,
  before any script. Non-Classic designs stamp `data-design="hmat-metal|hmat-ceramic"`.
- **Fonts are a separate axis:** `--font-display` / `--font-body`, chosen
  independently in the Lab. Tailwind: `font-display → var(--font-display)`,
  `font-sans → var(--font-body)`, `rounded-card → var(--radius-card)`.
- Registry: `src/lib/design/registry.ts` (designs, fonts, per-design defaults).
  Persisted store: `useDesignStore` (`localStorage` `honza-design`). A **pre-paint
  inline script** (`DesignScript`, first child of `<body>`) applies the saved
  design before first paint — **no flash**; falls back to Classic in a `try/catch`.
  `DesignRoot` keeps `<html>` in sync after hydration for live switching.
- **F0 is fixed for Hmat:** Czech body copy uses Geist Sans (full diacritics —
  `ě š č ř ž ů ď ť ň`). Pixel faces are **display-only**; the Lab **warns** when a
  display face is chosen for body. Classic deliberately keeps Share Tech Mono and
  the mid-word fallback.

## Mood expression engine

`src/lib/mood/expression.ts` — one `mood + design → expression` map:
`{ background, accent, energy, czLabel, caption }`. Every surface reads it via
`useMoodExpression`; `AppShell` sets `--accent`, `--energy`, and `--bg` app-wide.
**Accent hues are locked** (idle/excited `#E8432D`, thinking `#3A7BD5`, speaking
`#2E7D32`, oops `#C2185B`). idle and excited **share the hue** — the difference is
the **energy** channel (0.35 → 1.0), which drives the Hmat lit channel + orb
backlight brightness + motion amplitude. Never fix idle-vs-excited by re-hueing.

## Hmat — the tactile-material spec

Source of truth: `design-lab/round4-hmat.html`. CSS lives in `globals.css`
(the `.mat*` / `.fdock` / `.hmat-orb` utilities).

- **Recess (`mat-recess`)** — the signature move: the character leads every screen
  from inside an inset well (inner top shadow + bottom highlight).
- **Cards** — `mat` (outset: inset top-light + bottom-shadow + soft warm drop) and
  `mat-metal` (brushed-gradient variant).
- **Deep keys (`mat-key`)** — 6px mechanical travel (`box-shadow: 0 6px 0 …` →
  `translateY(5px)` on `:active`). Send / call controls are keys.
- **Lit channel (`mat-channel`)** — recessed channel whose inner glow is the mood
  accent, brightness × `--energy`.
- **Floating dock (`fdock`)** — detached from the bottom edge, rounded, material
  (not glass), the three tabs (**Chat · Hovor · Nastavení** — chat-first since
  2026-07-27; no separate Home tab), active tab accent-tinted with a sliding pill.
  Content is padded to clear it; nothing overlaps.
- **Metal vs Ceramic** — tokens only: `--mat-grain-opacity` (Metal `0.5`, Ceramic
  `0`) and the warmth mixes (`--mat-surface-warm`, `--mat-metal-warm`,
  `--mat-recess-warm`).

## The orb, re-authored (Hmat)

`HmatOrb` keeps the 15×15 dot matrix but adds an energy-scaled backlight,
emissive drop-shadow, specular dome, a **blink loop** (~5s, faster with energy),
and a `react-pop`. It uses the **round-4 pixel maps** (MLUVÍ = open-mouth "O",
MYSLÍ = up-looking eyes + thought bubble; every state a readable 2×2 eye pair +
distinct mouth). **Classic keeps its original maps** in `HonzaOrb` — the two map
sets are design-dependent, never merged.

## Icon set (system kit)

`src/components/icons/HardwareIcons.tsx` — geometric, square-cap, **embossed**
glyphs inheriting `currentColor` (→ the mood accent): `home` (2×2 dot-matrix
window), `chat` (3 square dots), `call` (**phone handset, not a mic**),
`settings` (machined sliders), `send`, `mic` (in-call mute only), `hang`. Built
once; used by both Hmat variants. Classic keeps its own minimal iconography on
nav labels but uses hardware icons on Call mic/hang (2026-07-28).
Type scale: `src/lib/design/typography.ts` (`TYPE` roles) — adopted on Hmat chat
bubbles and chrome.

## Interaction layer (2026-07-28)

Shared primitives in `src/lib/interaction/haptic.ts` + hooks:

- **`tapLight` / `tapMedium` / `hapticSuccess`** — `navigator.vibrate` wrappers;
  no-op on desktop/unsupported. Wired to mat-keys, send, dock tabs, call connect.
- **`useReactPop`** — one-shot orb pop on send, mood beats (excited/oops/speaking),
  call connect, orb tap. Hmat: `.hmat-orb .react-pop`; Classic: `.honza-pop`.
- **`useMoodReactions`** — mood transition → haptic + pop.
- **Micro-animations** — `animate-message-in`, `animate-drawer-in`, dock pill
  slide, channel pulse, card tilt on desktop (`.mat-tilt`).

**Chat layout (Hmat):** dual-mode — **hero** recess + `mat-metal` opener card until
the learner sends their first reply; then **compact** header (48px orb + channel).
Honza auto-initiates on load (no Start Chat gate). Classic gets the same behaviour
with flat chrome.

**Push (foundation):** Settings toggle + `/api/push/subscribe` + Supabase
`push_subscriptions` table. Scheduled sends not wired — copy stays honest until
VAPID + cron are provisioned.
