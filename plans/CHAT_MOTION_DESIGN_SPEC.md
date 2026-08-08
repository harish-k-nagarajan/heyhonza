# Chat Screen Motion & Personality — Design Spec

- **Status**: DRAFT — for Harish review/edit before implementation
- **Commit**: `1b639b9` (stamp when implementation starts; re-verify line refs if HEAD moves)
- **Scope**: `/chat` only — Classic + Hmat design families
- **Authority**: This doc supersedes ad-hoc motion notes for chat until marked DONE. `DESIGN.md` still wins on visual tokens (cream, dot-matrix, Share Tech / Hmat metal). Motion values below are sourced from the Emil Kowalski skill audit ([AUDIT.md](../.agents/skills/improve-animations/AUDIT.md)), revised for Honza’s real usage model.

---

## 1. Product context (decided)

| Assumption | Implication for motion |
| --- | --- |
| ~**10–15 messages per session** (both directions), configured daily cap | Motion is **occasional / standard UI**, not WhatsApp-scale. Personality and state indication are encouraged. |
| Short Czech practice conversations, not long bot relationships | Optimize for **clarity + tutor presence**, not speed-at-all-costs. |
| **Honza is the app** (`DESIGN.md`, `CLAUDE.md`) | Orb reactions, typing beats, and recess atmosphere are **in scope** — not “decoration to delete.” |
| Two shipped families: **Classic** + **Hmat** | Every feature ships in **both** unless explicitly marked Hmat-only. |

**Frequency tier for chat (Honza-specific):**

| Action | Tier | Motion stance |
| --- | --- | --- |
| Send message (tap or Enter) | ~15×/session | Light send feedback OK; no long blocking animations |
| Honza reply arrival | ~15×/session | **Typing indicator → reveal** is the signature beat |
| Orb pop on send | ~15×/session | **Keep**, but shorten/subtle (not delete) |
| History drawer | 0–2×/session | Standard enter/exit animation |
| Opener card (first message) | 1×/session | Slightly more delight OK |

---

## 2. Design principles

1. **Three layers** — (a) **Face** = 15×15 dot-matrix expression, (b) **Halo** = perimeter dots at recess edge, alive during thinking/speaking, (c) **Thread** = bubbles with conversational rhythm.
2. **No wireframe mesh** — Reference screenshot’s connected throbbing mesh is **out of scope**. Only discrete **edge dots**, no connecting lines, no `feDisplacementMap`.
3. **Typing, not typewriter** — iMessage-style **three-dot typing bubble**, then **full message reveal**. Never character-by-character Czech streaming.
4. **GPU-first** — Animate `transform` and `opacity` only. No `transition: all`. No animating `width`/`height`/`filter` on hot paths (note: existing `channel-pulse` uses `filter`; new work should prefer opacity/scale).
5. **Interruptible UI** — Prefer CSS **transitions** + `@starting-style` over `@keyframes` for bubbles that can stack or arrive quickly.
6. **Accessibility** — `motion-safe:` / `motion-reduce:` (existing pattern). Reduced motion = drop movement, keep opacity/color state changes.
7. **Cohesion** — One shared motion token set; Hmat and Classic use the same durations/easing, different surfaces.

---

## 3. Motion tokens (add to codebase)

Add to `src/app/globals.css` `:root` (or a dedicated `src/app/motion.css` imported by globals):

```css
:root {
  /* Strong curves — from Emil Kowalski AUDIT.md; do not approximate */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);

  /* Durations */
  --duration-press: 160ms;
  --duration-ui: 200ms;
  --duration-bubble-in: 220ms;
  --duration-drawer-in: 280ms;
  --duration-drawer-out: 200ms;
  --duration-orb-pop: 280ms;
  --duration-typing-min: 400ms;
  --duration-typing-max: 1200ms;
}
```

Wire into `tailwind.config.ts` where animations reference easing (replace bare `ease-out` on chat animations with `var(--ease-out)` or duplicate the cubic-bezier literals in keyframe `animation` shorthand).

**Exemplar to imitate:** `fdock-pill` in `globals.css` already uses `cubic-bezier(0.2, 0.8, 0.3, 1)` — consolidate toward the tokens above for chat.

---

## 4. Feature A — iMessage-style reply choreography

### 4.1 Problem

Today (`src/lib/client/chat-actions.ts`):

1. User sends → `status: "loading"`, mood `thinking`.
2. API returns → `addAssistantMessage(reply)` immediately, mood flashes `speaking`.
3. UI shows static `"thinking"` text inside a Honza bubble (`HmatChat.tsx:126–129`, `ClassicChat` has no in-thread typing bubble).

There is no **typing indicator**, no **minimum beat** after the API responds, and no **staged reveal**.

### 4.2 Target UX (state machine)

```
USER_SENDS
  → user bubble enters (transition, ~220ms)
  → orb: thinking + halo: thinking pulse + channel pulse (once)
  → [WAIT_API] composer disabled, no assistant bubble yet

API_RESOLVED
  → start TYPING_PHASE (min duration, see formula below)
  → show HonzaTypingBubble (three dots) in thread
  → orb: stay thinking OR shift to speaking (pick one; recommend thinking until reveal, then speaking flash)

TYPING_PHASE_END
  → replace typing bubble with real message (crossfade + translateY 4px → 0, 220ms --ease-out)
  → orb: flash speaking 900ms (existing `flashMood("speaking", { ms: 900 })`)
  → optional: hapticSuccess once on reveal

ERROR
  → hide typing bubble, show error, orb oops, optional single 150ms shake on error card
```

### 4.3 Typing duration formula

After API text is available, hold typing indicator for:

```
typingMs = clamp(400, 1200, 400 + reply.length * 12)
```

- Min **400ms** even if API was instant (reads human).
- Max **1200ms** (don’t stall practice).
- Do **not** block on typing if user navigates away.

### 4.4 New component: `HonzaTypingBubble`

**File:** `src/components/chat/HonzaTypingBubble.tsx`

| Prop | Type | Notes |
| --- | --- | --- |
| `variant` | `"classic" \| "hmat"` | Surface styles match `MessageBubble` / `HmatHonzaBubble` |
| `className` | optional | |

**Visual:**

- Same max-width and alignment as Honza assistant bubbles (`justify-start`).
- Three dots, 6–8px, `bg-accent` at 40% / 70% / 40% opacity cycling.
- Animation: CSS transition or stepped opacity, **450ms** loop, `ease-in-out`. Gate with `motion-safe:` / `motion-reduce:animate-none`.
- **No** `scale(0)` entrance — start `opacity: 0; transform: scale(0.95)` → `opacity: 1; scale(1)` via `@starting-style` or transition.

### 4.5 Store / hook changes

**Option A (recommended):** extend `useChatStore` with ephemeral UI state:

```ts
typingPreview: string | null;  // assistant reply waiting to reveal
setTypingPreview: (text: string | null) => void;
```

**Option B:** local state in a new `useReplyChoreography` hook wrapping send flow.

**`sendUserTurn` change** (`src/lib/client/chat-actions.ts`):

1. After API returns, call `setTypingPreview(reply)` instead of immediate `addAssistantMessage`.
2. `setTimeout` for `typingMs`, then `addAssistantMessage(reply)`, `setTypingPreview(null)`, `flashMood("speaking")`.
3. Clear typing preview on error.

**`initiateOpener`:** same choreography for the first opener (hero mode) — typing bubble in thread or under recess, then opener card / bubble reveal.

### 4.6 UI integration

| File | Change |
| --- | --- |
| `ClassicChat.tsx` | Render `<HonzaTypingBubble>` when `typingPreview` or `loading && !heroMode` (decide single condition); remove plain `"thinking"` span in bubble |
| `HmatChat.tsx` | Same; replace `HmatHonzaBubble` thinking placeholder |
| `MessageList.tsx` | Optional: centralize typing bubble at end of list |

### 4.7 Boundaries

- Do **not** add streaming/token-by-token LLM output.
- Do **not** delay user bubble appearance — only Honza’s side waits.
- Composer stays disabled only during `status === "loading"` (API in flight), not during typing phase (user can read; optionally allow typing next message — **default: keep disabled until reveal completes** to avoid race; document in implementation).

---

## 5. Feature B — Perimeter dot halo (“alive mat”)

### 5.1 Problem

`HmatPresenceRecess` has `hmat-pulse-glow` (blurred radial gradient, `globals.css:582–599`) — not discrete dots. `DESIGN_ELEVATION_PLAN.md` Phase 4 planned a full backdrop field; Harish wants **edge dots only**, not mesh, not center throbbing.

Classic chat hero has no equivalent atmosphere.

### 5.2 Target

**New component:** `src/components/honza/OrbDotHalo.tsx`

- SVG layer **behind** orb, **inside** recess, centered on orb.
- **28–36 dots** on a circle ~8–12% larger than orb radius (tune at 430px viewport).
- Each dot: small rounded rect (match matrix pixel shape) or circle, 2–3px, `fill: var(--accent)`, base opacity **0.10** (idle) → **0.35** (thinking peak).

**Animation (motion-safe only):**

| Orb state | Halo behavior |
| --- | --- |
| `idle` | Static or 5s breathe on opacity (±0.03) — **subtle** |
| `thinking` | Staggered opacity pulse: each dot `animation-delay: index * 50ms`, 1.2s loop, `ease-in-out` |
| `speaking` | One-shot ripple: opacity wave travels around ring in 600ms when message reveals |
| `oops` | Dots dim to 0.05, no pulse |

**Performance rules:**

- Animate **opacity** and **transform: scale()** per dot only.
- No blur on individual dots.
- No connecting paths/lines.
- `prefers-reduced-motion`: render static ring at 0.12 opacity.

### 5.3 Integration

| Location | Change |
| --- | --- |
| `HmatUi.tsx` → `HmatPresenceRecess` | Insert `<OrbDotHalo state={orbState} size={size} />` behind `HmatOrb` |
| `ClassicChat.tsx` hero header | Same halo behind `HonzaOrb` when `heroMode` |
| `ClassicChat.tsx` compact header | Smaller halo (avatar size) or omit — **default: omit in compact** to reduce noise |

### 5.4 Boundaries

- Do **not** implement `feDisplacementMap` or round-2 waveform mesh.
- Do **not** animate the 15×15 face grid cells for halo effect.
- Phase 4 full-field backdrop is **deferred** unless Harish promotes it later.

---

## 6. Feature C — Message & bubble motion (craft pass)

### 6.1 Message entrance

**Current:** `MessageBubble.tsx` uses `animate-message-in` keyframe (`tailwind.config.ts:83–86`).

**Target:**

```css
/* transition-based, interruptible */
.message-enter {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity var(--duration-bubble-in) var(--ease-out),
    transform var(--duration-bubble-in) var(--ease-out);

  @starting-style {
    opacity: 0;
    transform: translateY(4px);
  }
}
```

- User bubbles: align right, enter from `translateY(4px)` (not horizontal slide — simpler, less RTL risk).
- Stagger: keep `min(index, 3) * 50ms` transition-delay on **opacity only** (30–80ms range per AUDIT).
- Apply same pattern to `HmatUserBubble` / `HmatHonzaBubble` for parity.

### 6.2 Fix `transition: all`

| File | Line (approx) | Current | Target |
| --- | --- | --- | --- |
| `ChatActionBar.tsx` | 63, 123 | `transition-all duration-300` | `transition-[transform,opacity] duration-[160ms] ease-[var(--ease-out)]` |
| `ClassicChat.tsx` | 72 | `transition-all duration-300` on hero morph | `transition-[transform,opacity,gap] duration-[220ms] ease-[var(--ease-out)]` — audit whether `gap` causes layout; if jank, snap layout and only fade opacity |

### 6.3 Orb `react-pop` on send

**Current:** `useReactPop.ts` → `POP_MS = 550`, `honza-pop` / `hmat-pop` with bouncy `cubic-bezier(0.2, 1.5, 0.4, 1)`.

**Target:**

- Duration **280ms** (`--duration-orb-pop`).
- Curve: `cubic-bezier(0.23, 1, 0.32, 1)` (strong ease-out, not bounce).
- Peak scale **1.06** (not 1.1–1.12).
- Keep trigger on send — aligns with 15×/session delight budget.

### 6.4 Smooth scroll

**Keep** `behavior: "smooth"` on thread scroll (`MessageList.tsx`, `ClassicChat.tsx`, `HmatChat.tsx`) — appropriate at session volume. Optional tune: use `scrollTo({ behavior: "smooth" })` only when message count increases, not on loading toggles.

### 6.5 Opener card

**Keep** `animate-landing-fade-in` but update to **280ms** and `cubic-bezier(0.23, 1, 0.32, 1)` in `tailwind.config.ts`.

---

## 7. Feature D — Channel pulse on typing start

**Existing:** `MoodOrbStrip` accepts `channelPulse` → `animate-channel-pulse` (filter brightness).

**Target:** When `TYPING_PHASE` starts (API resolved, typing bubble shown), fire `channelPulse={true}` once for 450ms.

| File | Change |
| --- | --- |
| `ClassicChat.tsx` | Pass `channelPulse={typingPhaseActive}` to `MoodOrbStrip` |
| `HmatUi.tsx` | Add pulse class to `mat-channel` when typing — mirror `MoodOrbStrip` behavior |

**Future improvement:** reauthor `channel-pulse` keyframe to use opacity on `::after` glow instead of `filter` (perf). Not blocking v1.

---

## 8. Feature E — Chat history drawer exit

**Current:** `ChatHistoryDrawer.tsx:47` — `if (!open) return null` (instant unmount).

**Target:**

- Enter: keep `animate-drawer-in` 280ms `--ease-drawer`, backdrop 220ms `--ease-out`.
- Exit: mount closing state, animate `translateX(100%)` + backdrop opacity 0 over **200ms** `--ease-out`, then unmount.
- Pattern: `data-state="open" | "closing"` + CSS transitions (interruptible if user reopens).

---

## 9. Feature F — Secondary polish (P2 — after A–E)

| Item | Spec | Priority |
| --- | --- | --- |
| Error shake | `translateX` ±4px, 150ms, once, on error banner | P2 |
| End chat | Composer `opacity` + `translateY(8px)` out 200ms before session end | P2 |
| Haptic on reveal | `hapticSuccess()` in choreography hook when message lands | P2 |
| Hero → compact morph | Tighten to 220ms `--ease-out`; verify at 430px | P2 |
| History button hover | Gate behind `@media (hover: hover) and (pointer: fine)` | P2 |
| Drawer list items | Optional 30ms stagger on first open only | P3 |

---

## 10. Component inventory

### New files

| File | Purpose |
| --- | --- |
| `src/components/chat/HonzaTypingBubble.tsx` | Three-dot typing indicator |
| `src/components/honza/OrbDotHalo.tsx` | Perimeter dot ring |
| `src/hooks/useReplyChoreography.ts` | Typing timer, typing phase flag, reveal orchestration (if not in store) |

### Modified files (expected)

| File | Features |
| --- | --- |
| `src/lib/client/chat-actions.ts` | A — typing delay before `addAssistantMessage` |
| `src/stores/useChatStore.ts` | A — `typingPreview` state (if Option A) |
| `src/components/screens/chat/ClassicChat.tsx` | A, B, D, C |
| `src/components/screens/chat/HmatChat.tsx` | A, C |
| `src/components/chat/MessageList.tsx` | A, C |
| `src/components/chat/MessageBubble.tsx` | C |
| `src/components/screens/hmat/HmatUi.tsx` | B, D, C bubbles |
| `src/components/chat/ChatActionBar.tsx` | C |
| `src/components/chat/ChatHistoryDrawer.tsx` | E |
| `src/hooks/useReactPop.ts` | C |
| `src/app/globals.css` | Tokens, halo styles, message-enter |
| `tailwind.config.ts` | Updated easing/durations on chat keyframes |
| `MEMORY.md` | Post-ship notes |

---

## 11. Implementation order

Execute in this order — each phase is independently testable.

| Phase | Features | Est. files |
| --- | --- | --- |
| **0** | Motion tokens in CSS + tailwind | 2 |
| **1** | `HonzaTypingBubble` + store/choreography + `sendUserTurn` | 5–6 |
| **2** | Wire typing into Classic + Hmat chat screens | 2 |
| **3** | `OrbDotHalo` + recess integration | 3 |
| **4** | Craft pass: transitions, orb pop, opener easing | 4–5 |
| **5** | Channel pulse on typing | 2 |
| **6** | Drawer exit animation | 1 |
| **7** | P2 polish | as needed |

**Dependencies:**

- Phase 1 blocks Phase 2 and 5.
- Phase 0 blocks Phase 4.
- Phase 3 independent of Phase 1 (can parallelize).

---

## 12. Verification

### Mechanical

```bash
npm run lint
npm run build
```

Both must pass. No new dependencies.

### Feel check (430px mobile viewport)

- [ ] Send a message: user bubble appears immediately; Honza typing dots show after API; full reply replaces dots after ≥400ms; no flash of empty bubble.
- [ ] Send 3 messages quickly: animations don’t stack broken — typing state resets per turn.
- [ ] Orb halo pulses during thinking; one ripple on reveal; static under reduced motion.
- [ ] Orb pop on send is subtle (~280ms), not bouncy.
- [ ] History drawer opens and **closes** with slide — no snap disappear.
- [ ] `prefers-reduced-motion`: typing dots static or hidden; bubbles appear without translate; halo static.
- [ ] Classic **and** Hmat both pass the above.

### DevTools

- Animations panel at 10% speed: bubble crossfade has no double-text overlap (if overlap, add 2px blur during transition per AUDIT §7 — last resort).
- Performance: no layout thrashing on send (transitions on transform/opacity only).

### Done when

- All Phase 0–6 items implemented.
- `MEMORY.md` updated.
- Harish signs off on feel at 430px.

---

## 13. Out of scope

- Streaming LLM tokens / typewriter text
- Wireframe mesh orb (reference screenshot style)
- Full Phase 4 dot **field** behind face (only perimeter halo in this spec)
- `/call` screen motion (separate spec later)
- New npm packages (Framer Motion, etc.)
- Changes to conversation engine prompts or API routes beyond choreography timing

---

## 14. Open questions (for Harish to edit)

- [ ] **Composer during typing phase:** disabled until reveal completes, or allow drafting next message early?
- [ ] **Compact Classic header:** show small halo behind 64px avatar, or hero-only?
- [ ] **Opener in hero mode:** typing bubble in thread vs. only animating opener card?
- [ ] **Hmat thinking orb:** stay `thinking` during typing, or switch to `speaking` early?
- [ ] **Typing duration formula:** is `12ms × char` the right feel for Czech diacritics length?

---

## 15. Reference

- Emil Kowalski motion audit: `.agents/skills/improve-animations/AUDIT.md`
- Existing Phase 4 note: `design update/DESIGN_ELEVATION_PLAN.md` (perimeter halo is a subset)
- Design system: `DESIGN.md` § Hmat orb, interaction layer
- Current chat entry: `src/components/screens/chat/ChatScreen.tsx` → `ClassicChat` / `HmatChat`
