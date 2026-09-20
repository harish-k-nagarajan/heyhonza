# Honza — design system

> **Visual source of truth:** the Pencil file **`honza.pen`** (Handoff frames:
> Design Tokens, Components / Fern Mist O4, screens). Product chrome follows
> that file. This markdown file is an **index** (identity, type roles, Classic
> archive, implementation pointers). **When pixels disagree, the pen wins.**
>
> **Shipped type:** **Doto** (short labels / buttons) · **Inter** (Czech
> body). See [`design update/SHIPPED_DESIGN.md`](./design%20update/SHIPPED_DESIGN.md)
> and `SHIPPED_*` in `src/lib/design/registry.ts`. Type roles:
> `src/lib/design/typography.ts` (`TYPE`).
>
> Sections below that still describe cream cards / Share Tech Mono document the
> **Classic** baseline kept in-repo for comparison.

## Identity

The app is **Honza**. The character **is** the app: Nothing OS dot matrix meets a friendly Czech tutor. Every screen leads with the character. He is never treated as a small decorative icon on primary surfaces.

---

## Background

**Shipped (Fern Mist O4, `honza.pen`):** warm cream canvas with mood-tinted
surfaces via the expression engine (`--bg`, `--accent`, `--energy`). Recess,
frost dock, and frost fields are specified in the pen — not the old Hmat Metal
inset-well mock.

**Classic baseline:** warm cream / off-white `#F5F2EE`. Cards and bubbles sit on
this base. Per emotional state, the whole screen shifts mood using a tinted
surface plus accent (see Colors).

---

## Typography

### Shipped (authoritative)

| Role | Face | Notes |
|------|------|--------|
| Short labels, kickers, buttons, section chrome | **Doto** (`font-display`) | Labels weight **500** (`--font-display-weight`). Buttons / mat-keys weight **700** (`--font-display-weight-ui` via `display-ui-weight`). Hierarchy via **size + tracking**, not Tailwind weight utilities. |
| Long Czech text (bubbles, captions, body) | **Inter** (`font-sans`) | Full diacritics (`ě š č ř ž ů ď ť ň`). `font-medium` / `font-semibold` allowed where hierarchy needs weight. Body uses `tracking-normal`; sans headings / large titles use `tracking-tight`. |

**Type scale** — use `TYPE` roles from `src/lib/design/typography.ts`. Do not
scatter ad-hoc `text-[11px] tracking-[…]` classes on primary screens.

| Role | Use |
|------|-----|
| `kicker` | Tiny display eyebrow / mood overlines |
| `label` | Section / chrome labels (`// Nastavení`) |
| `meta` | Numerals, status chips, loading |
| `title` | Screen / card title (Doto) |
| `subtitle` | Supporting line under a title (Inter, muted, `tracking-normal`) |
| `heading` | Sans heading / large title (Inter, `tracking-tight`) — not Doto |
| `display` / `displayLg` | Hero / brand (in-app vs landing) |
| `body` / `bodySm` | Czech prose |
| `button` | Mat-keys and CTAs (Doto 700) |
| `helper` | Muted helper copy |

**Section labels:** uppercase, muted, often prefixed with `//` (see
`SectionLabel`). **Czech** in chat bubbles and teaching copy; **English** on the
marketing landing (Czech only in showcase samples). In-app Hmat chrome is Czech.

### Classic baseline (legacy)

- **Font:** Share Tech Mono (monospace). Do not extend Classic; new work uses `TYPE` + shipped fonts.
- Letter-spacing `0.2em` on general labels; section labels `0.25em`.
- Do not extend Classic; new work uses `TYPE` + shipped fonts.

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

Canonical cream behind everything: **`#F5F2EE`**. State backgrounds are overlays or section tints on top of that mental model. Accent hues are locked; idle vs excited is distinguished by **`--energy`** (0.35 → 1.0), never by re-hueing.

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

Hmat uses `HmatOrb` (round-4 maps, backlight, blink). Classic keeps `HonzaOrb`
maps. Do not merge the two map sets.

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

- **Product (O4):** orb **recess** (`.hmat-recess-hero`, spec in `honza.pen`), frost cards/fields, frost-dock. Max width ~**430px** phone stage (`max-w-landing` on `/welcome`). `mat-recess` remains only on a few non-orb wells (auth, onboarding, loading).
- **Classic baseline:** white cards on cream; **`border-radius: 16px`**; border **`1px solid rgba(0, 0, 0, 0.07)`**.
- **Bottom navigation (Hmat):** floating dock — Chat · Hovor · Nastavení; active tab accent-tinted with a sliding pill.

---

## Chat

- **Honza bubble:** left-aligned material card; Czech body via `TYPE.bodySm`.
- **User bubble:** right-aligned, **accent** fill, **white** text.
- **Timestamps / labels:** `TYPE.kicker` / `TYPE.label`.
- **Highlights** inside Czech copy (e.g. key phrase) may use accent at full strength.

---

## Reply composer

- **Placeholder:** Czech reply prompt with a **blinking underscore** cursor.
- **Field:** Hmat `mat-field` pill; Classic accent-border pill.
- **Send:** Hmat `mat-key` circle with hardware send icon; Classic filled accent circle.

---

## Buttons

Shared API: `src/components/ui/Button.tsx` + `src/lib/design/button.ts`.

| Prop | Values | Notes |
|------|--------|-------|
| `surface` | `flat` (default) · `mat-key` | `flat` = Classic accent-filled / bordered. `mat-key` = globals.css mechanical depth + 6px `:active` travel. |
| `variant` | `primary` · `secondary` · `ghost` · `danger` | `danger` = hang / destructive mat-key (white label). |
| `shape` | `pill` · `card` · `circle` | Mat-key only. Pill = full-width CTAs; card = section actions; circle = icon keys. |
| `size` | `sm` · `md` · `lg` · `call` · `icon` · `icon-md` · `icon-lg` | Pair with `shape` (see `buttonClassName` in `button.ts`). |
| `haptic` | `light` · `medium` · `none` | Mat-key defaults to `light`; send / call connect use `medium`. Respects `disabled`. |

- **Typography:** all buttons use `TYPE.button` (Doto 700 via `display-ui-weight`).
- **Focus:** `focus-visible:outline` ring using mood `--accent` (`BUTTON_FOCUS`); works on all five mood backgrounds.
- **Links:** landing CTAs that must stay `<Link>` use `ButtonLink` (`src/components/ui/ButtonLink.tsx`).
- **Classic baselines** (`ClassicOnboarding`, `ClassicSettings`, `ClassicCall`) keep `surface="flat"` (default) — unchanged.

---

## Implementation notes

- Export **`HONZA_STATE_COLORS`** from `HonzaOrb` (or a tiny `honza/theme` module if split later) so screens can set CSS variables or Tailwind arbitrary values for full-screen mood.
- Mood expression: `src/lib/mood/expression.ts` → `{ background, accent, energy, czLabel, caption }` via `useMoodExpression`; `AppShell` sets `--accent`, `--energy`, `--bg`.
- Keep tokens in sync with this document when adding new states or marketing surfaces.
- To change shipped fonts, edit `SHIPPED_*` in `registry.ts` and font loading in `src/app/layout.tsx` — do not re-add a Design Lab picker.

---

## On-disk references

- **Pixels / screens / components:** `honza.pen` (Pencil).
- Elevation / font lock notes: [`design update/SHIPPED_DESIGN.md`](./design%20update/SHIPPED_DESIGN.md).
- `design-lab/round4-hmat.html` is an **archive** of the Metal inset-well exploration. Do not restyle product chrome from it.

---

# Product chrome (Fern Mist O4)

Source of truth: **`honza.pen`**. CSS lives in `globals.css` (`.hmat-recess-hero`,
frost dock/fields, `.hmat-orb`). Hmat Metal / ceramic Lab variants do not ship.

## Token contract + theme runtime

- `data-design="hmat-metal"` on `<html>` selects the Hmat token block.
  Pre-paint script (`DesignScript`) and `DesignRoot` stamp shipped design +
  fonts (Doto / Inter) — **no flash**, no user-selectable Lab.
- Tailwind: `font-display → var(--font-display)`, `font-sans → var(--font-body)`,
  `rounded-card → var(--radius-card)`.
- Registry: `src/lib/design/registry.ts` (`SHIPPED_DESIGN`, `SHIPPED_DISPLAY_FONT`,
  `SHIPPED_BODY_FONT`).

## Recess, dock, and material (from `honza.pen`)

- **Orb recess (`.hmat-recess-hero`)** — raised peach-white (mood-tinted) card
  the character leads from. Spec: 24px radius; fill 165° `#FFE8DC` → `#FFF8F4`
  → `#FFFFFF` (idle); **inner** 1.5px `#FFFFFF99` stroke; outer shadows
  `0 8px 18px` mood glow (`#FF6B4A28` idle) **and** `0 -1px 0 #FFFFFFB3`.
  Padding `18 / 16 / 14 / 16`, gap 10. Inside: **liquid-glass** orb slab
  (~196 outer, rim ~22, face **120**) + 200×5 channel + 13/700 mood label.
  Translucent rim (backdrop blur) — no white stroke, no drop shadow — so a
  future speaking waveform can glow through the glass. Mood tints the glass.
- **Cards / fields** — frost cards and `frost-field` (semi-opaque + blur) as in
  the pen; leftover `.mat` / `.mat-metal` are archive.
- **Keys** — sage/fern keys in the pen; `Button surface="mat-key"` still exists
  for mechanical travel on some controls.
- **Lit channel** — under the orb recess: `200×5` mood-accent gradient
  (`#accent33` → accent → `#accent33`), opacity × `--energy`. Legacy beige
  `.mat-channel` trough remains only outside the recess.
- **Dock** — O4 frost-dock (Chat · Hovor · Nastavení); content padded to clear it.

## The orb, re-authored (Hmat)

`HmatOrb` keeps the 15×15 dot matrix but adds an energy-scaled backlight,
emissive drop-shadow, specular dome, a **blink loop** (~5s, faster with energy),
and a `react-pop`. Live orb backdrop (dot/waveform field) is Phase 4.

## Icon set (system kit)

`src/components/icons/HardwareIcons.tsx` — geometric, square-cap, **embossed**
glyphs inheriting `currentColor` (→ the mood accent): `home`, `chat`, `call`
(phone handset), `settings`, `send`, `mic`, `hang`, `history`.

## Interaction layer

Shared primitives in `src/lib/interaction/haptic.ts` + hooks:

- **`tapLight` / `tapMedium` / `hapticSuccess`** — `navigator.vibrate` wrappers.
- **`useReactPop`** — one-shot orb pop on send, mood beats, call connect, orb tap.
- **`useMoodReactions`** — mood transition → haptic + pop.
- **Micro-animations** — `animate-message-in`, `animate-drawer-in`, dock pill
  slide, channel pulse, card tilt on desktop (`.mat-tilt`).

**Chat layout:** hero recess (`.hmat-recess-hero`) + thread; Honza auto-initiates
on load (no Start Chat gate).

**Push:** Settings daily-check-ins toggle subscribes via `/api/push/subscribe`.
Cron `/api/cron/check-ins` writes the opener and `sendPushToUser` pings saved
devices. iOS only delivers after Add to Home Screen. Service worker is off in
`next dev`.
