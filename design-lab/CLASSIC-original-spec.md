# Classic — the original design specification (preserved)

This is the **original Honza design system as shipped**, kept here so the Design
Lab folder is self-contained and the baseline is never lost. It is the
byte-for-byte **Classic** fallback: the version the Design Lab compares every new
design against, and the version a user returns to by choosing "Classic."

> Authoritative source: [`../DESIGN.md`](../DESIGN.md). This file is a frozen
> snapshot for the archive — if the two ever disagree, `DESIGN.md` wins for the
> live system, but **Classic must keep rendering exactly as described here**,
> including its known font bug (see the note at the end). Do not restyle Classic.

---

## Identity

The app is **Honza**. The character **is** the app: Nothing-OS dot matrix meets a
friendly Czech tutor. Every screen leads with the character; he is never a small
decorative icon on primary surfaces.

## Canvas & background

- Global canvas: warm cream / off-white **`#F5F2EE`** (not pure white, not cold grey).
- Cards and bubbles sit on this base.
- Per emotional state, the whole screen shifts mood using a tinted surface + accent
  (applied app-wide when Honza's state changes).

## Typography (Classic)

- **Font:** Share Tech Mono (Google Fonts), loaded app-wide. All UI text uses this
  monospace dot-matrix voice. No Inter or rounded humanist UI fonts in chrome.
- **Letter-spacing:** `0.2em` on general mono labels; **`0.25em`** on section labels.
- **Section labels:** uppercase, muted, `//`-prefixed (e.g. `// TODAY'S LESSON`).
- **Czech** in chat bubbles / teaching copy; **English** for nav, settings, meta.

## Colors — emotional states

| State | Background tint | Accent |
|---|---|---|
| **idle** | `#FFF4EE` | `#E8432D` |
| **thinking** | `#EEF2FF` | `#3A7BD5` |
| **speaking** | `#EEFFEE` | `#2E7D32` |
| **oops** | `#FFF0F5` | `#C2185B` |
| **excited** | `#FFF4EE` | `#E8432D` |

Canonical cream behind everything: **`#F5F2EE`**. The accent drives borders,
primary buttons, Honza's face pixels, links, and the composer border/send control.

## HonzaOrb (the character)

- **Shape:** square **dot-matrix** face — not a circle, not a soft blob.
- **Pixels:** small rounded squares (`<rect>` with small `rx`), faint background
  grid so the inactive matrix reads as hardware.
- **Features from dots:** eyes (2×2 / 3×2 blocks), smile/frown arcs, open mouth
  (solid rect), thought squares (top-right), tears (vertical column), sound
  (squares to the right), cheeks (single faint square each side, stronger in excited).
- **Sizes:** hero (home/lesson lead) min **200×200**; avatar (chat header) **64×64**.
- Pixel maps live in `src/components/honza/HonzaOrb.tsx`; palette in `theme.ts`
  (`HONZA_STATE_COLORS`). Keep those in sync with `DESIGN.md`.

## Character states & motion

| State | Meaning | Motion (reduced-motion off) |
|---|---|---|
| `idle` | waiting | scale 1→1.03→1, 3s ease-in-out, infinite |
| `thinking` | generating | opacity 0.7→1→0.7, 0.8s, infinite |
| `speaking` | just spoke | scale 1→1.06→1, 0.4s ease-out, once per entry |
| `oops` | grammar slip | subtle idle-like breathing / static |
| `excited` | great answer | idle family, slightly stronger scale (~1.04) |

State change: ~200ms crossfade between expressions. All motion respects
`prefers-reduced-motion`.

## Cards, layout, chat, composer

- **Cards:** near-white on cream; `border-radius: 16px`; border `1px solid rgba(0,0,0,0.07)`.
- **Section labels:** mono, ~8px effective, `letter-spacing: 0.25em`, muted, `//` prefix.
- **Max width:** ~**430px** centered "phone stage" on large viewports.
- **Bottom navigation:** mono tab labels; dot indicator for the active tab — no
  bubbly pill primary nav. **Four tabs:** Domů / Chat / Hovor / Nastavení.
- **Chat:** Honza bubble left, white card, accent-tinted mono; user bubble right,
  accent fill, white text; timestamps mono muted ~9px.
- **Composer:** placeholder `REPLY IN CZECH_` with blinking underscore; pill field,
  accent border; filled circular accent send button, white icon.

---

## Known bug that Classic keeps on purpose (F0)

Classic loads `Share_Tech_Mono({ subsets: ["latin"] })`. Share Tech Mono ships
**only a `latin` subset** — Czech's `ě š č ř ž ů ď ť ň` live in Latin Extended-A,
outside it, so **9 of 15 accented Czech characters silently fall back** to the
system monospace mid-word. This is a real, verified defect (see `../DESIGN_AUDIT.md`
§F0). **Classic keeps it** — restyling Classic would make it a dishonest baseline.
The redesign (Hmat) fixes it by using Geist faces, which carry the full Czech set.
