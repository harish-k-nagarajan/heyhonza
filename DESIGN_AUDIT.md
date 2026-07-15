# Honza — design audit (2026-07-15)

Audit of the shipped UI before the Design Lab refresh. Read with `DESIGN.md` (the
system as specified) — this doc is about the *gap between the spec and the felt
experience*, and the directions that close it.

---

## 1. What's actually good (do not throw away)

- **The mood → app-wide tint loop.** `useMoodStore` → `AppShell` sets both the
  surface tint and `--accent`, so borders/buttons/links recolor as one coherent
  mood. This is genuinely distinctive and is the seed of the whole product.
- **The square dot-matrix orb.** Hardware-adjacent, not a mascot, not Duolingo.
  It carries personality without a cartoon.
- **The cream canvas + `//` section labels.** A real point of view.
- **Honza initiates.** The product's actual differentiator is already wired.

## 2. The findings

### F0 — **The app's font cannot render the language the app teaches** 🔴
The headline finding, and a real bug rather than a matter of taste.

`layout.tsx` loads `Share_Tech_Mono({ subsets: ["latin"] })`. Share Tech Mono
**publishes only a `latin` subset** — there is no `latin-ext` to opt into. Its
unicode-range is `U+0000-00FF` plus a few strays. But Czech's `ě š č ř ž ů ď ť ň`
live in **Latin Extended-A (U+0100–017F)**, outside that range.

Verified against the live Google Fonts CSS: **9 of the 15 accented Czech
characters fall back** to the system monospace.

```
ě š č ř ž ý á í é ú ů ď ť ň ó
· · · · · ý á í é ú · · · · ó     · = not in the font, silently falls back
```

So *"Těší mě. Čeština je krásná řeč."* renders **in two different typefaces
today**, mid-word — mismatched weight, width, and baseline. Honza's Czech has
never actually been set in Honza's font.

This reframes the Geist request: it isn't a restyle, it's **the fix**. All five
Geist Pixel variants plus Geist Mono/Sans carry the full Czech set (verified with
fontTools, 420 glyphs each).

### F1 — The mood system is invisible where it matters
The tint is a ~4% wash on a cream background. Five moods, but `idle` and
`excited` are **the same palette** (`#FFF4EE` / `#E8432D`). So the two states a
learner most needs to feel apart — *"I'm waiting"* vs *"you nailed it"* — are
chromatically identical. The emotional payload rests entirely on a 1.03 vs 1.04
scale difference on the face. **Nobody will ever perceive that.**

### F2 — The "MIT toggle" is a dev harness, not a feature
The pill at the top cycling colors is `MoodCycler`, gated behind
`NEXT_PUBLIC_HONZA_DEV_TOOLS=1`. It's a QA tool for the Phase 2 verification
gate. It reads as a mystery control because it *is* one. **But the instinct
behind liking it is right**: it's the only place in the app where the mood
system is legible as a system. The answer isn't to keep the debug pill — it's to
make the real UI express what that pill exposes.

### F3 — Everything is a centered column of identical white rectangles
Home, Chat, and Settings are the same visual sentence: cream bg, 16px white
card, `//` label, body text. There is no hierarchy, no rhythm, no surprise. The
Settings page is nine consecutive identical cards. Nothing pops because
everything is weighted the same.

### F4 — Zero iconography
There is exactly one icon in the entire product (the send arrow). Nav is text
labels with a 4px dot. Section labels are text. Nothing is scannable at a
glance; every element must be *read*.

### F5 — The character is present but not *responsive*
Honza's face changes state, but nothing else acknowledges you. No reaction to a
correct answer beyond a scale bump. No streak, no rally, no "he remembers." The
brief asks for a friend who checks in and a sparring partner — the current UI
delivers a text field with a face above it.

### F6 — Corrections are invisible
The core loop is *"Honza corrects, encourages, continues"* — but a correction
arrives as undifferentiated prose in a plain bubble. The single most valuable
moment in the product has **no design at all**.

### F7 — Type has one size and one voice
Share Tech Mono at 11–15px everywhere, `tracking-[0.2em]` on nearly everything.
Monospace + heavy tracking at small sizes is the *least* legible combination
available, and it's applied to Czech — a language whose diacritics (ě š č ř ž ď
ť ň ů) are precisely the detail a learner must see. **This actively fights the
teaching goal.**

### F8 — The 430px stage is treated as a limit, not a stage
On desktop it's a narrow column on dead cream. No ambient framing, no device
feel — just a truncated page.

---

## 3. Typography finding: Geist Pixel is a *display* face

All five Geist Pixel variants (Square, Grid, Circle, Line, Triangle) ship in
`geist@1.7.2` and — verified with fontTools — **all cover the full Czech
diacritic set** (420 glyphs each). So the request is viable.

**But it should not be the body font.** Geist Pixel is a decorative pixel face;
at 15px, `ř` vs `r` and `ě` vs `e` degrade toward each other. Per F7, that's the
exact failure mode the app can least afford.

**Recommendation:** Geist Pixel **Square** for display, chrome, labels,
numerals, and the character's voice — it's the *same visual language as the
dot-matrix orb*, which is a real find. **Geist Mono / Geist Sans** for Czech
body copy and corrections. The Design Lab exposes both axes so this is testable
rather than argued about.

---

## 4. Directions — deliberately not in this document

A first attempt (2026-07-15/16, branch `design/lab-refresh`, discarded) proposed
three directions here. Harish rejected them as narrow and first-idea, and he was
right: they were generated in a single pass from the model's own head, without
invoking the installed taste skills, and against a **stale local `main`** — the
session never ran `git fetch`, so it designed a 3-tab app when `main` had already
merged Phase 8 (`2af8e6f`, PR #8) adding `/call` as a fourth surface.

**Directions belong to a real exploration round, not to this audit.** The audit's
job is the verified findings above (F0–F8), which are base-independent and still
true. See `mega-prompt-honza-redesign.md` §3.P0 and §4 Phase 1 for the exploration
that replaces this section: at least 8 divergent directions, skills actually
invoked, Harish chooses before any app code is written.

Two constraints that survived from that attempt and are not up for rediscovery:

- **Classic stays byte-for-byte.** It is the baseline the Lab compares against;
  restyling it makes the comparison dishonest. It keeps Share Tech Mono — F0 bug
  and all — for the same reason.
- **The mood system is the seed of the product**, and the debug pill
  (`MoodCycler`) is a symptom, not a feature. The redesign's job is to make the
  real UI express what that pill exposes, so the harness becomes redundant.
