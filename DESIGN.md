# Honza — design system

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
