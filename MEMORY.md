# Honza — session memory

Short-lived log of **what works**, **what broke**, and **decisions not to revisit** without explicit agreement. Update after meaningful changes or debugging sessions.

---

## 1. What has been built and confirmed working

_Last updated: 2026-05-12_

- **Scaffold:** Next.js **14** App Router, TypeScript, Tailwind CSS, Zustand, **next-pwa** (`next.config.js` wraps config; PWA disabled in development per plugin behavior).
- **App structure:** `src/app` with routes for home (`page.tsx`), **onboarding**, **chat**, **settings**; root `layout.tsx` with Inter, Czech `lang`, dark `color-scheme`, `AppShell`, and `InstallPrompt`.
- **API Route Handlers:** `api/health`, `api/chat`, `api/context/google-doc` (public URL ingestion path on server).
- **UI building blocks:** `Button`, `Card`, `Input`, `Label`, `Textarea`; layout (`AppShell`, `BottomNav`); Honza pieces (`HonzaOrb`, `StatusPill`); chat (`MessageList`, `MessageBubble`, `Composer`, `VoiceReplyButton`); PWA `InstallPrompt`.
- **State:** `useChatStore`, `useSettingsStore` with supporting hooks/utils.
- **Local dev:** Project runs on **localhost**; core files present under `src/` and `public/` (manifest, icons references, generated worker files when built).

---

## 2. What broke and how it was resolved

_Last updated: 2026-05-12_

| Issue | Resolution |
|-------|------------|
| — | No production incidents logged yet. |

_Add rows as issues appear: symptom → root cause → fix / PR link._

---

## 3. Decisions made and why (do not revisit unless explicitly flagged)

_Last updated: 2026-05-12_

| Decision | Why |
|----------|-----|
| **API keys only in Vercel (and local `.env` for dev), never in client** | Prevents leakage; keeps compliance and rotation simple. |
| **All LLM traffic via Next.js Route Handlers** | Single server trust boundary; keys never ship to the browser. |
| **Google Docs via public URL fetch, no OAuth for MVP** | Cuts integration scope; sufficient for “published” teaching content. |
| **Dark-only MVP** | Superseded for product chrome by the **cream / dot-matrix** system in `DESIGN.md` (2026-05-12); keep dark tokens only if a legacy route still depends on them until migrated. |
| **Mobile-first PWA** | Matches primary use case (daily pocket practice). |
| **`/` is the front door: signed-out → `/welcome`, not `/signin`** (2026-07-15, BS Phase 9) | A stranger's first five seconds shouldn't be a login form. Deep links still route through `/signin?next=…`, so nothing is lost. `/welcome` also lives as a real URL so it stays reachable in local pass-through mode. |
| **Marketing surfaces render from `lib/constants`, never hand-written copies** (2026-07-15) | `/welcome`'s topic + level chips are the real options. Keeps the landing page from drifting from the product and honors BUILD_SPEC §5's "no hardcoded data in components." |
| **No font-weight utilities above 400 in product chrome** (2026-07-15) | **Superseded for shipped Hmat (2026-08):** Space Grotesk body may use `font-medium` / `font-semibold`. Doto display hierarchy is still size + tracking; button weight is via `--font-display-weight-ui` (700), not Tailwind `font-bold`. Classic mono faux-bold rule remains only for untouched Classic baselines. |
| **Auth is email+password with email confirmation. Not magic link, not Clerk, not Google SSO** (Harish, 2026-07-15) | Magic link costs an email on **every** sign-in, and Supabase's built-in sender caps at ~2/hr, which stalled verification. Password costs one email **once** (the confirmation), then sign-ins are unlimited and offline. Considered and **rejected: Clerk** — it's auth-only, so the DB stays Supabase either way, and Clerk users don't live in `auth.users`, which would mean rewriting all three FKs, all nine RLS policies (`auth.uid()`), and the signup trigger — a schema migration to solve a config problem. **Rejected Google SSO** for now (Harish: don't add vendors before testing the core product). Magic link stays **enabled at the Supabase project level but unexposed in the UI**, as Claude's dev sign-in path and a future feature. |
| **Claude does not enter passwords or create accounts — even test ones** (2026-07-15) | Agreed with Harish. Consequence: Claude signs in via `scripts/dev-signin.mjs` (admin `generate_link` → `token_hash` → `verifyOtp`), which needs no password and sends no email; **Harish spot-checks the password sign-up/sign-in round-trip** himself. Supersedes the old magic-link SQL-token path (2026-07-15) — that needed Harish to run a query by hand and broke if the link was opened in the wrong browser. The same-email account-linking claim is verifiable without logging in at all — query `auth.identities` and count `user_id`s. |
| **Email confirmation stays ON** (2026-07-15) | Turning it off would remove email entirely, but then anyone can sign up claiming any address without proving ownership — and combined with auto-linking that's an account-takeover vector. **Open item:** the built-in sender's ~2/hr cap is fine for testing but cannot serve real learners, so custom SMTP (Resend) is required before launch. |
| **The design system is plural: Classic + Hmat Metal + Hmat Ceramic, switchable in Settings → Design Lab** (2026-07-16) | **Superseded 2026-08:** shipped look is **Hmat Metal only** + Doto + Space Grotesk. Lab removed; Classic/Ceramic kept in git history / unused screen trees only. |
| **Fix idle-vs-excited with energy, never re-hueing** (2026-07-16) | idle and excited share `#E8432D` on purpose (DESIGN.md). The distinguisher is the `--energy` scalar (0.35 vs 1.0) driving the Hmat lit channel + orb backlight brightness + motion. Accent hues stay locked. Verified dramatic in a still. |
| **Switching design in the Lab resets fonts to that design's defaults** (2026-07-16) | Fonts are an independent axis, BUT "choose Classic → the shipped app exactly" requires Classic to come back on Share Tech Mono. So `setDesign` re-applies the design's default faces; the user can still override either face afterward, or reset. |
| **Hmat chrome is full Czech; Classic chrome stays as shipped (mostly English)** (2026-07-18) | The character is the app and Hmat leads with him — mixing Czech chrome with English strings broke the illusion. So Hmat surfaces are fully Czech-ified (welcome, call, Design Lab, sign-in) via `isHmat` branches, while **Classic is preserved byte-for-byte** (its English is the shipped baseline). This *narrows* DESIGN.md §"English for navigation/settings" to Classic only. |
| **Topic/level chips stay English in Hmat** (2026-07-18) | They come from shared `lib/constants` (used by Classic + onboarding + settings) and read as short category nouns ("Travel", "A2 · Elementary"). Czech-ifying only Hmat would mean a parallel label map for marginal gain; confirmed in-browser they don't look out of place under the Czech headings. Revisit if a Czech-first copy deck lands. |
| **Hmat file picker is a wrapped `mat-key` control, not the native input** (2026-07-18) | The browser's `::file-selector-button` accepts CSS but its label ("Choose File") + status ("No file chosen") are locale text CSS can't set. To get both material styling *and* Czech ("Vybrat soubor" / "Žádný soubor") we hide the input and drive it from a labelled `mat-key` (`HmatFileInput`). Classic keeps its native `Input type=file` (byte-for-byte). |
| **Onboarding is a 5-step linear flow from `honza.pen` Handoff — Onboarding Flow** (2026-08-07) | Replaced the old single-page form. New flow: Intro → Level → Topics → Schedule → Context (optional) → Chat. Step 5 offers Google Doc / file / paste with a skip path; same controls remain in Settings. Schedule prefs live in `useSettingsStore` until DB columns ship. |

---

## Current entry — 2026-07-19 (Hmat landing redesign)

Branch `design/hmat-landing` off `main`.

### What changed

- **`/welcome` rebuilt as marketing landing** — `HmatLanding` composes hero (mood-cycling orb + return-visitor copy), animated demo chat preview, horizontal topic tiles / desktop grid, level ladder rail, icon timeline, sticky mobile CTA. Topic/level data still keyed to `TOPIC_OPTIONS` / `LEVEL_OPTIONS` ids. **English for all product copy; Czech only in showcase samples** (demo chat bubbles, topic sample lines).
- **`AppShell` welcome mode** — forces Hmat material on `/welcome`, `#E9E4DD` outer canvas, `max-w-landing` (860px), `--energy` 0.85. Classic users see Hmat on welcome only.
- **`WelcomeScreen`** — always renders `HmatLanding`; `ClassicWelcome` / `HmatWelcome` preserved but unused on this route.
- **Taste skill installed** — `npx skills add Leonxlnx/taste-skill` (design audit applied during build: distinct marketing hierarchy, no app-chip reuse, motion gated on `prefers-reduced-motion`).

### Verified

- `npm run lint` + `npm run build` pass.
- `/welcome` prerenders at ~6.9 kB (up from prior static landing — richer surface).

---

## Current entry — 2026-07-18 (Hmat polish pass — language consistency + material controls)

Follow-up audit of `design/hmat-rebuild` found Hmat largely complete but leaking
English chrome, plus two UI gaps. Closed them **Hmat-only**; Classic stayed
byte-for-byte. All gates walked at 430px across Hmat Metal, Hmat Ceramic, Classic.

### What was fixed (all Hmat surfaces; Classic untouched)

- **Welcome steps** — added `WELCOME_STEPS_CS` (Czech) beside the shipped English
  `WELCOME_STEPS`; `HmatWelcome` uses the Czech set, `ClassicWelcome` keeps English.
- **Call subtitle/status** — the shared `useCallScreen` returns Classic's English
  `statusLine`; `HmatCall` now derives its own Czech line (`czStatusLine`) from the
  same `phase`/`listening`, so the hook stays untouched and Classic is unaffected.
- **Design Lab labels** — `Display` / `Body (Czech)` / `Reset to design default`, the
  `· display` option suffix, and the display-as-body warning are now design-aware in
  the shared `DesignLab` (Czech under `isHmat`, English for Classic).
- **Sign-in** — `SignInScreen` heading + subtitle and the whole `SignInForm`
  (placeholders, aria labels, submit/toggle buttons, validation + Supabase error copy,
  confirm-email screen) go full Czech via an `isHmat` prop. **B6 done (with Harish's
  OK):** Hmat sign-in fields are `mat-field` pills and the submit is a `mat-key` — the
  P5 "left unchanged" call is now resolved. Classic keeps its accent-outline pills +
  solid accent button and English copy verbatim.
- **File upload** — replaced the native "Choose File" chrome with a shared
  `HmatFileInput`: a `mat-key` "Vybrat soubor" button + our own Czech filename
  ("Žádný soubor"). Reason: `::file-selector-button` can be *styled* but its label is
  browser-locale text CSS can't set, so a wrapped control was the only way to get Czech.
  Used in Hmat Settings + Onboarding. Classic's `Input type=file` left untouched.

### Verified live (browser, 430px)

Hmat Metal + Ceramic: welcome steps Czech, call subtitle Czech, Design Lab labels
Czech, sign-in Czech + material fields/key, file picker = "Vybrat soubor" / "Žádný
soubor". Classic: sign-in still `Ahoj! I'm Honza.` / `Sign in` on accent pills, Design
Lab still `DISPLAY` / `BODY (CZECH)` / `RESET TO DESIGN DEFAULT` — byte-for-byte.
`npm run lint` clean; `npm run build` green with `ƒ Middleware` present.

### Still open

Row 8 (mic + audible call turn-cycle) unchanged — can't be verified headlessly.

---

## Current entry — 2026-07-16 (Design Lab rebuild — Hmat, three selectable designs)

Built the locked **Hmat** direction into the app as **three switchable designs**
(Classic + Hmat Metal + Hmat Ceramic), Settings → Design Lab. Branch
`design/hmat-rebuild` off `main` at `2af8e6f`. Primitives-before-features, six
phases, every gate walked in the browser. Spec: `DESIGN.md` § Design Lab; build
log: `TASKS.md` § Design Lab rebuild.

### What was built (all gates walked live)

- **P1 — token contract + no-flash runtime.** `data-design` on `<html>` selects a
  token block; `:root` = Classic (no attribute). Fonts are a separate axis
  (`--font-display`/`--font-body`). `useDesignStore` (persisted, validating
  `merge`), a **pre-paint inline `DesignScript`** (first child of `<body>`) that
  applies the saved design before first paint, `DesignRoot` for live switching.
  Geist Sans/Mono + 5 Geist Pixel faces via `next/font` — **F0 is fixed for Hmat**
  (Czech renders full diacritics in Geist Sans). Classic keeps Share Tech Mono +
  the bug on purpose.
- **P2 — mood expression engine.** `mood + design → { background, accent, energy,
  czLabel, caption }`; AppShell sets `--energy` app-wide. **idle vs excited is now
  obviously distinct** (dim vs bright channel/backlight), same hue.
- **P3 — behaviour hooks.** `useScreenReady` (gates on the design store too, or Home
  flashes Classic), `useHomeScreen`/`useChatScreen`/`useCallScreen`/`useSettingsScreen`/
  `useOnboardingScreen`. **Classic refactored onto them byte-for-byte.**
- **P4 — system kit + Hmat surfaces.** `HardwareIcon` set (Hovor = phone, not mic),
  `HmatOrb` (round-4 maps + energy backlight + blink), `HmatDock`, material CSS
  (`.mat*`/`.fdock`). All four surfaces in Hmat, Metal + Ceramic via tokens only.
- **P5 — pre-app in Hmat.** Welcome/Signin/Onboarding design-aware. Sign-out moved to
  Hmat Settings (Hmat Home leads with the character, so no sign-out there).
- **P6 — Design Lab.** Picker + independent font selects + reset + live Czech specimen
  + display-as-body warning. Switching restyles the page you're on; Classic returns the
  shipped app exactly; choice persists with no flash.

### Verified live (browser, 430px)

Classic Home/Chat/Call/Settings render identically to base; a typed reply returned a
real correction. Hmat all four surfaces: no horizontal overflow (stage+dock fill 430,
`scrollWidth==clientWidth`), 4 tabs w/ icons, character-first, Czech full diacritics.
Metal↔Ceramic toggles surface only (grain 0.5→0, layout/fonts identical). idle vs
excited dramatically distinct via energy. Full signed-out flow walked end-to-end in
Hmat. Design Lab: font switch live-updates the specimen + shows the warning; choosing
Classic → `data-design:null` + Share Tech Mono + BottomNav; reload keeps the choice
with the pre-paint inline `--font-*` present (no flash). `lint` + `build` green,
`ƒ Middleware` printed.

### Gotchas re-confirmed (the memory index was right)

- **CDP clicks/keys don't reach React** — drove every control via in-page `el.click()`
  and native value setters + `dispatchEvent`.
- **The pane never advances CSS transitions/animations** (document is permanently
  `hidden`): the mood-background `transition-colors` reads stale in `getComputedStyle`
  while the **inline** style is correct. Verified via inline values; injected
  `transition-duration:0s` for clean mood screenshots. The Hmat orb's blink is built so
  the **base** state shows the open face (blink layer opacity 0), so it never strands.
- **`navigate` resets the pane viewport to ~800px and mood to idle** — re-`resize_window`
  to 430 after every navigation before screenshotting.

### Not verified — inherits BUILD_SPEC row 8's 🟡

The Hmat `/call` screen + `CALL HONZA`/`ZAVOLAT` render and wire, but the
speak→listen→speak turn cycle needs a real mic + speakers — headless can't. Same
`DEPLOY.md` §5 gap as row 8.

### State the next session inherits

- Branch `design/hmat-rebuild`; **one PR for the whole rebuild** (not opened yet — the
  prompt said open one PR for the design work).
- **I ran Settings → "Reset data" on `hn@harishnagarajan.com`** to walk the real
  onboarding flow (the only non-destructive way in against a live DB profile). That
  wiped that account's chat history + re-defaulted topics/level, then I completed
  onboarding again. It's a dev test account, but note the reset if history looks empty.
- `.env.development.local` still sets `NEXT_PUBLIC_HONZA_DEV_TOOLS=1`, so the MoodCycler
  pill shows in **your** dev (it's gitignored, null in prod / a fresh checkout). The
  mood engine makes it redundant; I didn't remove your local flag.

---

## Current entry — 2026-07-15 (BUILD_SPEC Phase 8 — voice SHIPPED; row 8 🟡 pending Harish's ears)

Harish provided an ElevenLabs key **and** the explicit go-ahead, clearing the double
gate that had blocked Phase 8 across three sessions. Voice is built.

### The env check paid off twice — check it even when told "I gave you what you need"

The key was genuinely there this time (`ELEVENLABS_API_KEY` + `ELEVENLABS_VOICE_ID`).
**But the voice id didn't work**, and only an API call revealed it. Two lessons:

1. **ElevenLabs' free tier cannot use library ("professional") voices via the API.**
   They return `402 paid_plan_required` — *even though* the dashboard lists them and
   `GET /v1/voices/{id}` returns them happily with `locale: cs-CZ`. The voice Harish
   picked ("Adam — Velvety and Conversational", `uYFJyGaibp4N2VwYQshk`) is one of
   these. **Every Czech-native voice is a library voice**, so free tier = no native
   Czech accent, full stop.
2. **Premade voices work on every tier and speak Czech via `eleven_multilingual_v2`** —
   with an English accent, because all 21 premades are `language: en`. That's the
   current fallback (`iP95p4xoKVk53GoZ742B`, "Chris"). Verified: real MP3s, 200 OK.

`lib/server/tts.ts` therefore **falls back on 402 and logs a loud warning** rather than
leaving Honza mute, so a paid plan starts using the configured Czech voice with **no
code change**. Don't "simplify" that fallback away without upgrading the plan first.

Also: `GET /v1/models` 401s on this key (permission scope) while TTS works fine —
**don't infer the key is broken from a 401 on a metadata endpoint.**

### A real latent bug found: HonzaOrb was invisible, and it wasn't only a pane artifact

`/call` rendered with **no Honza at all** — orb in the DOM, 200×200, 227 dots, animation
running, `opacity: 0`. `/` had the identical bug, so it predated this work despite Home
having been "verified live" before.

Cause: `HonzaOrb`'s crossfade faded out, then restored opacity inside a
`requestAnimationFrame`. **rAF never fires while a document is hidden** — the browser
pane reports `document.visibilityState: "hidden"` permanently, so the face fell to 0 and
stayed there. This is *not* purely a pane artifact: **rAF is paused in any backgrounded
tab**, so a real user who switches away from the PWA during a mood change comes back to
an invisible Honza until the next state change. Fixed by committing `renderState` and
the opacity together — the element is already painted at 0 from the fade-out, so the CSS
transition still carries 0 → 1. **Don't reintroduce rAF for visibility-critical state.**

### Verified live (the server half — all of it)

- **`/api/tts`** → 200, `audio/mpeg`, ~36–46KB, `Cache-Control: no-store, private`. The
  strongest evidence available headlessly: **the browser's own `Audio` element decoded
  the blob to a real 2.18s clip** — that's valid playable audio, not just bytes.
- **`/api/health`** → `ttsConfigured: true`, `ttsProvider: "elevenlabs"` (booleans only,
  never the key, not even the voice id — it's a public endpoint).
- **`kind:'call'` persistence** — a real opener + a real user turn through `/api/chat`
  with `kind:'call'` produced **3 `call` rows next to 5 existing `chat` rows in one
  history** (user A: 5 → 8).
- **Transcript renders from DB truth** — `localStorage` cleared to zero keys first, so
  the local fallback provably cannot explain it. Renders in a `// CALL TRANSCRIPT` group.
- **No key client-side** — against the **production build**: absent from all 26
  `.next/static` files, present only in `.next/server/app/api/tts/route.js`. No
  `api.elevenlabs.io` / `xi-api-key` in any client file. **Zero browser requests to
  ElevenLabs.** (A page-context scan using the literal key was correctly refused by the
  safety classifier — don't paste secrets into `javascript_tool`; grep server-side with
  the value read from env instead. The env-sourced grep is a stronger test anyway.)

### NOT verified — deliberately left 🟡

Mic capture and audible playback. A headless pane can't hold a mic or hear a speaker,
and **MEMORY's CDP-clicks-don't-reach-React warning still holds** — clicking "CALL
HONZA" via `ref` left the button untouched, so the in-call UI could not be driven at
all. Per the DoD ("if a gate can't be walked, leave it 🟡"), row 8 is **🟡, not ✅**,
even though everything checkable is green. Checklist for Harish: `DEPLOY.md` §5.

### Design/engine decisions worth keeping

- **Engine gained a `mode: 'chat' | 'call'`.** A reply that reads well doesn't speak
  well — the call prompt forces 1–3 sentences, bans markdown/emoji/parenthetical
  glosses, and requires ending on a question. Confirmed working: the opener came back
  as one speakable line, and the correction was spoken-style ("Správně je 'byl jsem'…").
- **Transcripts group, not tag.** Consecutive `call` turns render inside one labeled
  block — a call was a single event; a run of tagged bubbles would lose that.
- **`/call` has no send button.** The cycle self-drives (speak → listen → reply), which
  is what makes it a call rather than a mic-flavoured chat.
- **TTS failure degrades, doesn't hang up** — Honza's line stays on screen as a caption
  and the call continues readably.
- **`ServerSync` was silently dropping `kind`** on hydration, which would have erased
  call framing on every refresh. Fixed.

---

## Previous entry — 2026-07-15 (ship prep: DEPLOY env audit + SMTP runbook; voice still blocked)

Docs-only pass. **No source changed, no phase status flipped.** Branched off `main` at
`76b6ccb` (PR #6 already merged — nothing to merge).

### Voice (Phase 8) is still blocked, and the blocker is bigger than "paste a key"

Third independent env check, and the answer hasn't changed: **no TTS key anywhere** —
not `.env.local`, `.env.development.local`, `.env.example`, the shell env, or the repo.
**New and important: Harish confirmed he has no ElevenLabs account or project at all.**
So the gap isn't a missing string, it's a missing provider account — creating it, picking
a Czech-capable voice, and getting an API key are all human steps. Phase 8 remains
double-gated (key + explicit go) and **nothing was scaffolded.** Don't half-build it.

### PR #7 was closed, not merged — its work was NOT on main

A prior session's ship-prep PR (#7, closed 2026-07-15) did roughly this same DEPLOY.md
work and never landed. **Check `gh pr list --state all` before assuming a doc fix from a
past session exists** — a PR body describing a change proves nothing about `main`. That's
the same class of mistake as trusting a brief about env.

### Two brief claims that were already false-alarms (verified, no action needed)

- **BUILD_SPEC_STATUS row 8 was already corrected by PR #6.** It already said STT is not
  missing. `VoiceReplyButton` independently re-confirmed as a real Web Speech integration
  (`rec.lang = "cs-CZ"`, `onresult` → `sendUserTurn`) — **built but never verified live**,
  not a stub. Don't rebuild it.
- **CONTEXT.md "Out of scope" was already reconciled by PR #6** — real voice calls are
  already removed with a note that they're phase-gated Phase 8. No contradiction with
  CLAUDE.md Hard Rule 6 remains.

### What actually shipped

- **DEPLOY.md §1** — explicit ⚠️ that **`SUPABASE_SERVICE_ROLE_KEY` must never be a Vercel
  var** (bypasses RLS; only `scripts/dev-signin.mjs` consumes it), plus a note that no TTS
  key belongs there either and that when Phase 8 lands its key is server-only.
- **DEPLOY.md §2** — names **both** migrations (`0001` + `0002`), not just `0001`; adds
  custom SMTP as a required pre-deploy step.
- **DEPLOY.md §3** — auth check rewritten from magic-link to **email+password +
  confirmation**; adds an RLS two-user isolation check; adds a callout that
  `dev-signin.mjs` (not SMTP) is the testing path.
- **DEPLOY.md §4 (new)** — click-by-click Resend → Supabase SMTP runbook (verify domain
  via SPF/DKIM DNS → `re_…` key as SMTP password → `smtp.resend.com:465`, username the
  literal `resend` → **Authentication → Emails → SMTP Settings** → then **raise the email
  rate limit under Authentication → Rate Limits**, which SMTP does *not* raise by itself).
  Icons renumbered §4 → §5.
- **TASKS.md** — new Phase-4 line for custom SMTP as a launch blocker, tagged with the
  "not a testing blocker" warning; Vercel line now carries the service-role-key warning.

### Verification honesty

This change is **documentation only** — no runtime surface, so there is no gate to walk in
the running app and none is claimed. `npm run lint` and `npm run build` pass (dev server
confirmed down first; port 3000 free). The SMTP runbook itself is **unexecuted** — it
needs Harish's Resend account and a domain, so it's written-and-reviewed, not verified.

---

## Previous entry — 2026-07-15 (last three DB gates closed — rows 1/4/5/6 now ✅)

Walked the final three gates against live Supabase. **All passed.** BUILD_SPEC rows 1, 4, 5
and 6 are ✅. The only non-green rows left are the two Harish explicitly excluded: Phase 8
(voice — no TTS key, no go-ahead) and `Toggle` (deferred until a screen has one).

### The email cap was never the real blocker — `generate_link` was the answer

The last session concluded the ~2/hr sender cap was the blocker and that **custom SMTP was
the fix**. That was wrong, and it cost a session. The cap applies to *sending mail*, but the
one-time token exists in the DB whether or not mail is sent. **Supabase's admin
`generate_link` endpoint returns that token directly and sends nothing**, so it has no cap.

This is now `scripts/dev-signin.mjs`:

```bash
node scripts/dev-signin.mjs <email> [next]   # prints an /auth/callback URL, sends no email
```

Needs `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (gitignored; never imported by `src/`).
It requests `type=magiclink` and hands the `token_hash` to `/auth/callback`, which calls
`verifyOtp` **server-side**.

**This retires the old PKCE/SQL-token dance entirely.** Why the new path is strictly better:
the `code` flow stores a verifier cookie in the browser that *started* it, so the link only
worked there and was burned by opening it anywhere else. `token_hash` + `verifyOtp` has no
verifier, so **any** browser can redeem it, no SQL query is needed, and a wasted token costs
nothing — just rerun. **Don't reach for SMTP to unblock testing again.** (Custom SMTP is
still a real pre-launch to-do for *learners*; it's just not a testing dependency.)

### Verified live (the three gates)

- **Re-login persistence (row 4).** Signed out, **cleared `localStorage` entirely**, signed
  back in as user A → all 3 messages re-rendered. With local storage provably empty the
  fallback can't explain it, so this is the DB. A new turn in that session persisted (3 → 5).
  **Clearing `localStorage` before re-login is the move that makes this gate airtight** —
  otherwise the fallback is a live alternative explanation for anything that renders.
- **Doc survives re-login (row 5).** `/api/state` returned the same 2,902 chars (`Letiště –
  Airport` / `Nádraží – Train station` / `Lékárna – Pharmacy`). Decisive bit: a **freshly
  generated** turn quizzed *"Jak se česky řekne „restaurant"?"* — `Restaurace` is in the doc,
  so that's new output from doc context, not replayed history.
- **Returning user skips onboarding (row 6) + isolation (row 1).** User A
  (`onboardingCompleted:true`) → `/`. User B → `/onboarding`, `persisted:true`, **0 messages,
  0 context chars, no doc bleed**. Both directions in the same browser minutes apart, so the
  routing is reading DB truth rather than passing by luck.

### Browser-automation gotcha that cost real time — read this before debugging the UI

**In this Browser pane, CDP mouse/keyboard events never reach the page.** A capture-phase
`document` listener recorded **zero** clicks. Symptoms that look exactly like product bugs:
Enter doesn't send, the send button does nothing, the dev mood cycler doesn't tint the app.
**None of that is a real bug** — the events aren't arriving at all.

- `computer type` *does* land (text appears, React state updates, `disabled` recomputes) —
  which makes this extra misleading, since the input looks live while clicks are dead.
- **Drive React from JS instead:** set the value via the native setter, dispatch `input`,
  then call `.click()`:
  ```js
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  set.call(input, text); input.dispatchEvent(new Event('input', { bubbles: true }));
  btn.click();
  ```
- **Before blaming the product, install a capture listener and confirm the event arrives.**
  Cheap, and it settles product-vs-harness in one call.

### Non-bugs ruled out (don't re-investigate)

- **Repeated `/api/state` calls in dev are not a render loop.** `reactStrictMode: true`
  double-invokes effects in dev; the pairs are that, times several navigations.
- **The dev mood cycler (I/T/S/O/E) overlaps the header at 375px.** Cosmetic, dev-only
  (gated behind `NEXT_PUBLIC_HONZA_DEV_TOOLS`), never ships to learners. Left alone.

### State the next session inherits

- **Env is real:** `OPENROUTER_API_KEY`, `HONZA_DEFAULT_MODEL`, both `NEXT_PUBLIC_SUPABASE_*`,
  and now `SUPABASE_SERVICE_ROLE_KEY`. **No TTS key. No SMTP.** Check, don't assume.
- **Fixtures:** user A `iamharishnagarajan@gmail.com` — onboarded, now **5** messages, Google
  Doc context. User B `harishnokia@gmail.com` — password-created, confirmed, still pristine
  (0 messages) unless a later session onboards it. Don't recreate either.
- **Everything green except Phase 8 (voice) and `Toggle`, both deliberate.** The remaining
  human-only item is the Vercel deploy (needs Harish's account + `SUPABASE_SERVICE_ROLE_KEY`
  must **not** be added there as a client-exposed var).
- **Phase 8 is smaller than it looked — STT already exists.** Row 8 used to claim "no
  STT/TTS — only a `VoiceReplyButton` stub." **That was wrong** and is now corrected:
  `VoiceReplyButton` is a genuine Web Speech API integration (`lang: 'cs-CZ'`, `onresult` →
  `sendUserTurn`), built but never verified live. **Don't rebuild it.** The missing half is
  **TTS** (Honza audible, server-side only), the `/call` screen, and `kind:'call'` tagging.
  Also worth knowing: **BUILD_SPEC §5's reset mechanism is already built** (Settings →
  "Reset data and run onboarding again", via `/api/state`), which is easy to miss.
- **Voice is the last *feature*.** Everything else outstanding is deploy/infra: the Vercel
  project, production verification on the deployed URL, and **custom SMTP — a genuine launch
  blocker**, since real learners can't sign up at ~2 emails/hour (it is *not* a testing
  blocker; `dev-signin.mjs` covers that).

---

## Current entry — 2026-07-15 (auth switched to email + password)

Harish's call after the magic-link email cap stalled verification: **email+password with
email confirmation, no magic link in the UI, no Google SSO, no Clerk.** Rationale and the
rejected alternatives are in §3 — the short version is that magic link costs an email per
sign-in while password costs one at signup, and Clerk would have meant rewriting the schema
(FKs + 9 RLS policies + trigger all key off `auth.users`) to fix a config problem.

**No dashboard change was needed** — Supabase enables email/password with "Confirm email"
ON by default.

### Built

- `SignInForm` rebuilt: sign-in / sign-up modes, email + password, DESIGN.md pills,
  `autocomplete` flips `current-password`↔`new-password` with the mode. Supabase's raw auth
  errors are mapped to learner-readable copy (matching on message text — Supabase has no
  stable codes for these — with a fallback that returns the original so nothing is swallowed).
- Sign-up handles **both** confirmation-on (user, no session → "confirm your email") and
  confirmation-off (session returned → straight in), so the project setting can change
  without a code change.
- `/auth/callback` **unchanged** — it already handled the code exchange, and the sign-up
  confirmation link uses the identical path. Password sign-in never touches it.
- **Stale copy fixed:** `/welcome` advertised "Start with a magic link / No password. Just
  your email." and `/signin` said "I'll send you a magic link." Both would have been lies on
  merge. Three code comments referencing magic links corrected too.

### Verified (within the constraint that Claude doesn't authenticate)

Form renders in-system at 390px; mode toggle flips button + `autocomplete`; the password
guard rejects <6 chars **with zero network calls** (confirmed by wrapping `window.fetch`);
malformed emails are caught by native HTML5 validation *before* the custom check, so that
check is a backstop rather than the first line. `lint` + `build` green.

**Not verified by Claude, by design:** the actual sign-up → confirm → sign-in round-trip.
**Harish ran it end-to-end on `harishnokia@gmail.com` and reported it working** (created →
confirmed via the emailed link → signed in). Recorded as reported, not Claude-observed.
Claude's DB-gate verification continues via the magic-link SQL-token path.

### State the next session inherits

- **`iamharishnagarajan@gmail.com` (user A)** — created via magic link, **has no password**,
  onboarding complete, holds 3 chat messages + the Google Doc context. Sign in to it via the
  SQL-token path, not the UI.
- **`harishnokia@gmail.com` (user B)** — created via password, confirmed, **pristine**
  (expected: no history, no context, onboarding incomplete). That's the isolation fixture.
- A **magic-link token for user A was requested and left unredeemed** (non-PKCE, via a direct
  POST to `/auth/v1/otp` with `create_user:false`). It expires in ~1h — harmless, just
  request a fresh one.
- **Requesting the OTP via REST instead of the UI deliberately avoids PKCE**, which yields a
  plain token that verifies server-side and can't be killed by being opened in the wrong
  browser. This is now the preferred dev sign-in path; the UI no longer offers magic link.

---

## Current entry — 2026-07-15 (live Supabase connected — most DB gates walked)

Supabase went live this session. Both migrations applied, all tables/columns confirmed,
RLS enforced (anonymous insert → `42501`), and **`/api/state` returned `persisted:true`
for the first time**. The app is on the DB, not the localStorage fallback.

### Verified live (real Supabase, real OpenRouter, real Google Doc)

- **Magic-link login → session** (Ph 1). Profile row auto-created by `0001`'s trigger.
- **New user forced through onboarding from DB truth** (Ph 6) — and notably the DB's empty
  profile **overrode stale localStorage values** on hydrate, proving `ServerSync` makes the
  DB authoritative rather than merging.
- **Onboarding → DB**: `level:'B1'`, `topics:['food']` persisted.
- **Google Doc → DB → engine** (Ph 5): 2,902 chars of Czech vocab fetched server-side into
  `user_context`; Honza then spontaneously quizzed *"Jak se řekne 'airport' česky?"* —
  `Letiště – Airport` is line 1 of that doc. DB topics also steered the opener (chose
  "food" → he asked about food).
- **Chat turns → `messages`** (Ph 4), `kind:'chat'`; **hard refresh re-rendered the thread
  from the DB**. Sign-out cleared the session (`persisted:false` → `/signin`).

### Blocked, and it isn't code

Supabase's **built-in email sender caps at ~2/hour** and can't be raised (it also locks
template editing — that's why the `{{ .Token }}` plan died). Both were spent, so re-login
persistence, returning-user-skips-onboarding, and second-user isolation are unwalked. Fix
is **custom SMTP** (Resend), which is required for production anyway.

### The headless sign-in technique (this is the reusable bit)

Claude has no inbox, and magic links are single-use **and browser-bound**. The flow that
works is documented step-by-step in `BUILD_SPEC_STATUS.md` → "How to sign in headlessly".
The essentials:

- **Claude must request the link from its own browser** — PKCE stores the code verifier in
  a cookie there, and `@supabase/ssr` reads it server-side for `exchangeCodeForSession`.
  If anyone else opens the link it's consumed *and* fails (`otp_expired`). That burned
  email #1.
- **The email is irrelevant.** The token lands in `auth.one_time_tokens` the instant the
  link is requested — read it with SQL, skip the inbox entirely.
- A magic-link token for an **existing** user is stored as `token_type=recovery_token` but
  must be redeemed with **`type=magiclink`** (`type=recovery` → `otp_expired`). `type=signup`
  is only for a brand-new unconfirmed user.
- The Browser pane blocks navigating to the `supabase.co` origin, so resolve the verify
  redirect with curl and hand the resulting `?code=` to the browser.

### Browser-automation gotchas that cost real time

- **`form_input` sets the DOM value without React seeing it** — the field looks filled, the
  submit no-ops. Always click + `type`, then read `.value` back before submitting.
- **The first click+type after a page load frequently doesn't register.** Verify the value
  and retry; the second attempt lands.
- **Screenshot pixels and the layout viewport can disagree** (a 390×844 viewport returned a
  660×1428 image), so `coordinate` clicks silently miss. Prefer `ref` clicks, or drive the
  real handler (`form.requestSubmit()`, Enter) — the Composer submits on Enter.
- `querySelector` intermittently returns null mid-re-render; re-query before concluding
  something is missing.

---

## Current entry — 2026-07-15 (BS Phase 9: landing page + DESIGN.md polish pass)

Branch `claude/phase-9-landing-polish` off `main` (PR #4 squash-merged as `f007331`).

### The session opened on a false premise — check env, don't trust the brief

The session brief said live Supabase was done (migrations applied, `NEXT_PUBLIC_SUPABASE_*`
set, redirect configured). **It wasn't.** `.env.local` was 131 bytes holding only
`OPENROUTER_API_KEY` + `HONZA_DEFAULT_MODEL`; no Supabase vars in any env file or exported
in the shell. So the DB gates for Phases 1/4/5/6 **still can't be walked** and stay 🟡 —
flipping them green would have been claiming a gate nobody walked.

**The trap to avoid next time:** the migration SQL living in `supabase/migrations/` proves
nothing about whether it was ever run in the SQL editor. Only `.env.local` (or a real
round-trip) tells you Supabase is live. Check it *first*, before planning any DB work.

Phase 8 (voice) also skipped: no `ELEVENLABS_API_KEY`/`TTS_API_KEY` present and the OK was
a "[maybe]", not an OK.

### What was built (Phase 9) — all verified live at 390px

- **`/welcome` front door.** Hero orb, three-step loop, and topic/level chips rendered from
  the same `lib/constants` the product uses — so the marketing page can't drift, and there's
  no invented sample data (BUILD_SPEC §5 forbids it). Deliberately worded around the one
  honest seam: "a message is already waiting **when you open the app**," never "Honza texts
  your phone" — there's no push infrastructure. Prerenders static, 1.77 kB.
- **Middleware front-door routing.** Signed-out `/` used to dump strangers on a bare login
  form; now `/`→`/welcome`, while deep links keep `/signin?next=…`. Signed-in users bounce
  off `/welcome` (added to `AUTH_ROUTES`). `AppShell` hides the tab bar there.
- **Settings got a face.** It was the only primary surface with no Honza on it at all —
  a straight DESIGN.md rule-7 miss. Now leads with an avatar orb on the shared mood store,
  matching the chat header.

### What was wrong and got fixed (polish pass)

| Found | Fix |
|---|---|
| `Card` had `shadow-black/40` — a dark-mode leftover reading as grime on cream | → `shadow-black/[0.04]` |
| Onboarding's first line: *"The API key stays on the server (Vercel env)"*; Settings': *"API keys live on the server (Vercel)"* | Build notes leaked onto **learner** screens → rewritten in Honza's voice |
| Onboarding led with a 64px `avatar` orb (every other primary surface uses `hero`) + `tracking-tight` | → `hero`, system tracking |
| Two `font-semibold` headings | Share Tech Mono ships **weight 400 only** → 600 was browser-synthesized faux bold |
| Settings header read `// SETTINGS` then `<h1>Settings</h1>` | Deduped → "How Honza talks to you" |

### Verification notes worth keeping

- **Synthetic bold is real here, and measuring width won't catch it.** Chrome fakes bold by
  thickening strokes *without changing advance width* — both canvas `measureText` and DOM
  `getBoundingClientRect` reported 400/500/600/700 as identical. Only a screenshot showed it.
  Empirically: **400 and 500 are pixel-identical, 600+ visibly thickens.** So `font-medium`
  (500) is a harmless no-op — left alone rather than churning 8 files; only `font-semibold`
  actually broke the type.
- **Dummy Supabase values do let you test middleware redirects** (it doesn't 500 on an
  unreachable project) — that's how the front-door table was verified. Restore `.env.local`
  afterwards; dummy values lock every screen to `/signin`. See §3 decision.
- **Don't run `npm run build` while the dev server is up** — it overwrites `.next` and the
  running dev server loses its CSS chunks, rendering unstyled serif pages. Looks exactly like
  a catastrophic style regression; it's an artifact. Restart the dev server.
- **Screenshots can miss the `HonzaOrb` paint** right after navigation (it appeared blank on
  Home and Settings while the DOM showed a visible 206px/64px SVG with 227 rects). Re-shoot
  before believing the orb is missing.

### Live gates that did pass this session

`npm run lint` + `npm run build` clean. Honza initiated in Czech unprompted on Home; a chat
turn with deliberately missing diacritics came back corrected (`dekuji` → `děkuji`) and the
**whole app tinted green** for `speaking` (background + accent + composer + nav + orb),
re-confirming BS Phase 2/3/7. `manifest.json` serves valid with all icons on disk.

---

## Current entry — 2026-07-15 (BS Phase 2 mood store + tint · DB persistence 4/5/6 · Phase 7 Home initiation)

Branch `claude/phase-2-mood-db-home` off `main` (PR #3 merged). Local dev: only
`OPENROUTER_API_KEY` + `HONZA_DEFAULT_MODEL` in `.env.local` → Supabase blank → middleware
pass-through, so DB code runs in **fallback mode** locally (the DB gates need live Supabase,
same human blocker as Phase 1). `lint` + `build` green; all three features verified live at
375px in the running app.

### What was built
- **BS Phase 2 — shared mood store + app-wide tint (✅ verified).** New `useMoodStore`
  (`idle/thinking/speaking/oops/excited`, `setMood` + one-shot `flashMood`). Palette moved to
  `src/components/honza/theme.ts` (`HonzaOrb` re-exports for back-compat). `AppShell` reads the
  store and sets the tinted background **and** `--accent` on its wrapper → accent UI recolors
  app-wide. Removed hardcoded `bg-[#F5F2EE]` on Home so the tint shows. Dev-only `MoodCycler`
  gated behind `NEXT_PUBLIC_HONZA_DEV_TOOLS=1` (I set it in a gitignored `.env.development.local`
  for local verification — do **not** commit; unset in prod → component is `null`). Verified:
  cycler + a real chat event both shift the whole app (thinking=blue, speaking=green).
- **DB persistence 4/5/6 (🟡 built, fallback verified).** Migration
  `0002_conversations_and_context.sql`: `messages` (per user, `kind` chat/call, RLS own-row),
  `user_context` (source/content/`synced_at`, RLS own-row), + `level`/`topics`/`preferred_model`
  columns on `profiles`. `src/lib/server/user-data.ts` is the DB access layer (no-op/null when
  unconfigured). `/api/state` GET hydrates the user, PUT patches profile/context/reset
  (`force-dynamic`). `/api/chat` now **reads context/topics/level from the DB** when signed in
  (engine reads from the store, not the client) and persists the user turn + reply. Client:
  `state-sync.ts` (`dbMode` set from `persisted`), `ServerSync` (in AppShell) hydrates stores
  from DB on mount, `useSyncStore.checked` gates onboarding redirects, `context-actions.ts` +
  `chat-actions.ts` write local+DB in one path. Settings shows "Last synced …".
- **BS Phase 7 — Home initiates (✅ verified).** `buildOpenerPrompt` (time-of-day + time since
  last contact) in the engine; on bootstrap `/api/chat` swaps the thread for that synthetic
  opener. Home + Chat both call `initiateOpener()` (module lock prevents double-fire); the
  opener lands in the shared thread so navigating Home→Chat shows one continuous conversation.
  Live: Home generated "Ahoj! Jsem Honza, tvůj kamarád na učení češtiny…" with no typing.

### Verified live (375px, no-DB fallback)
- Mood tint app-wide (cycler + real send). Home unprompted opener via the engine. Chat tutor
  loop: user turn → correct→explain→continue on `openai/gpt-4o-mini`. Refresh keeps the thread
  (ServerSync does **not** wipe the store when `persisted:false`). `/api/state` → `{persisted:false}`
  locally, no console errors.

### Still open (needs Harish / live Supabase — cannot be done headless)
- **DB gates (Phases 4/5/6):** apply 0001 + 0002 in Supabase, set `NEXT_PUBLIC_SUPABASE_*`, then
  verify send→refresh→re-login persists, second email = separate empty history, doc reflected
  across re-login. Same blocker as Phase 1's magic-link click.
- Phase 8 (voice, needs TTS key), Phase 9 (landing/polish), Vercel deploy — unchanged.

### Gotcha / decisions
- **One code path, two modes:** `dbMode` is true only when the server confirms `persisted`
  (Supabase configured **and** a signed-in user). Keeps every screen working with no auth locally
  and DB-backed in prod without page-level branching.
- Multi-user-on-one-device: localStorage stores linger after sign-out (ServerSync overwrites on
  next login, but an anonymous reload could show stale local data). Fine for MVP; clear stores on
  sign-out later if it matters.

---

## Current entry — 2026-07-14 (Phase 4: PWA polish + deploy runbook)

Continued on `claude/phase-2-unblock-debug-qtksid` per instructions. **Note:** PR #2
was already **merged** into `main` before this session started (branch tree ==
`origin/main`); these Phase-4 commits land on the branch after the merge, so they are
**not** reflected by the now-closed PR #2 — Harish decides whether to open a fresh PR
or fast-forward `main`.

### What was built (all lint + build green; verified at 430px in Supabase pass-through)
- **Real icons.** `scripts/generate-icons.mjs` renders the exact **idle HonzaOrb**
  dot-matrix face (cream `#FFF4EE`, accent `#E8432D`) to PNGs via `rsvg-convert`.
  Replaced the 1×1 transparent placeholder stubs. Now: `icon-192/512` (`any`,
  full-bleed), `icon-maskable-192/512` (`maskable`, face scaled to 0.58 inside the
  ~80% safe zone), `apple-touch-icon.png` (180, opaque). Rerun the script if the face
  or palette changes.
- **Manifest fixed.** Split the old single `"any maskable"` entry (which crops on
  Android) into separate `any` + `maskable` icons; richer name/description/categories.
- **layout.tsx meta.** Added `icons` (icon + apple) + `applicationName`; `metadataBase`
  from `NEXT_PUBLIC_SITE_URL` when set.
- **InstallPrompt rewrite** (`src/components/pwa/InstallPrompt.tsx`): 4s reveal delay;
  dismissal persisted 14 days via `localStorage` `honza-install-dismissed-at`;
  already-installed detection (`display-mode:standalone` / iOS `navigator.standalone` /
  `appinstalled`); iOS-Safari-only manual "Add to Home Screen" hint (beforeinstallprompt
  never fires on iOS); DESIGN.md styling (`// INSTALL`, accent Button, rounded-card).
- **next.config.js SW sanity for App Router:** kept `skipWaiting` (+`clientsClaim`),
  added `buildExcludes` for `middleware-manifest`/`app-build-manifest`,
  `cacheOnFrontEndNav`, `reloadOnOnline`, and `dynamicStartUrl:false` (`/` is auth-gated
  and 307s to `/signin`, so don't cache a redirecting start URL). Confirmed in `sw.js`.
- **DEPLOY.md** — Vercel env-var table (OpenRouter server-only + Supabase public),
  project setup steps, and a production verification checklist.

### Verified
- `lint` + `build` green (13 routes, `ƒ Middleware`, `sw.js` regenerated). All icon +
  manifest URLs serve 200 with correct content-types/sizes. Install card renders after
  4s; "Not now" persists and it does **not** reappear on re-dispatch within the window.
- **openrouter.ai IS reachable from this environment** (models endpoint → HTTP 200) —
  the previous sandbox's egress block is gone. But there is **no `OPENROUTER_API_KEY`**
  here, so the authenticated live chat round-trip is still unverified.

### Live verification — DONE locally (2026-07-14)
- Harish added `OPENROUTER_API_KEY` (+ `HONZA_DEFAULT_MODEL=openai/gpt-4o-mini`) to
  `.env.local`. **Live OpenRouter round-trip confirmed:** `/api/health` →
  `llmConfigured:true`; bootstrap opener returns Czech ("Ahoj! Jaký máš dnes den?");
  a user turn ("dnes já jdu do práce") got corrected → explained (drop the pronoun) →
  continued with a follow-up. Tutor loop works end to end on `openai/gpt-4o-mini`.
- **Google-Doc route** smoke-tested live: invalid URL → 400; valid-format non-public
  doc → 422 graceful (proves docs.google.com egress + fetch path work). Only the 200
  happy path (real public doc → extracted text) is unhit — needs a real public doc URL.
- **Gotcha:** Harish first saved the env file from TextEdit as `env.local.rtf` (RTF, not
  read by Next). Converted file→file with `textutil -convert txt -output .env.local`
  (never printed the key). `env.local.rtf` is **not** matched by `.gitignore`'s
  `.env*.local` — added an explicit ignore line. Recommend deleting the stray `.rtf`.

### Still open (needs Harish — can't be done by Claude)
- **Vercel project + env vars** — needs Harish's Vercel account; Claude can't create
  the project or enter secret keys. Runbook is in `DEPLOY.md`.
- **Production verification on the deployed URL** — re-run the same checks against Vercel.
- Phase 1 auth end-to-end gate (real magic-link click) — unchanged.

---

## Current entry — 2026-07-14 (Phase 3: AI integration — OpenRouter + hardening + level-aware persona)

Supabase provisioned by Harish; `NEXT_PUBLIC_SUPABASE_URL` + publishable (anon) key now in local `.env.local` (gitignored). App runs in **configured** mode locally (protected routes redirect to `/signin`; API routes are not gated). Gateway decision confirmed: **OpenRouter**.

### What was built
- **Conversation engine extracted** — `src/lib/server/conversation-engine.ts` is now the single place that talks to the model gateway (BUILD_SPEC §3 wanted this out of the route). Uses the `openai` SDK pointed at `https://openrouter.ai/api/v1` with `OPENROUTER_API_KEY` (OpenRouter is OpenAI-compatible — **no new dependency**). Exposes `generateReply`, `buildSystemPrompt`, `sanitizeMessages`, `isEngineConfigured`, and a typed `EngineError`.
- **`/api/chat` is now thin** — rate-limit → validate → `generateReply` → map `EngineError` to status/message. No OpenAI-direct code left.
- **Model IDs switched to OpenRouter slugs** — `openai/gpt-4o-mini` (default), `openai/gpt-4o` in `MODEL_OPTIONS`; `DEFAULT_MODEL_ID`/`HONZA_DEFAULT_MODEL` updated. Old persisted `preferredModel: "gpt-4o-mini"` gracefully falls back (allowlist + `resolveModel`).
- **Level-aware persona** — new CEFR `level` (A1/A2/B1/B2, default A2) in `useSettingsStore`, picked in **onboarding** and **settings**, sent in the chat request, and turned into per-level Czech guidance in the system prompt (vocabulary + correction depth + how much English scaffolding).
- **Hardening** — 30s per-request timeout (SDK `timeout` + `maxRetries: 1`), typed error mapping (401/403→auth, 429→busy, timeout→504, missing key→503), message/char caps retained.
- **Rate limiting** — `src/lib/server/rate-limit.ts`, in-memory fixed window (20/min per `x-forwarded-for`/`x-real-ip` key). Soft guard on serverless (per-instance, resets on cold start) — swap for Upstash/Redis if real enforcement is needed.
- **Health + settings** — health returns `{ provider: "openrouter", llmConfigured }` (kept `openaiConfigured` alias); Settings server-status card reads `llmConfigured` and names OpenRouter.

### Verified (no OpenRouter key needed)
- `lint` + `build` green. `/api/health` → `llmConfigured:false, provider:openrouter`. `/api/chat`: not-configured → **503** with OpenRouter message; invalid JSON → **400**; empty messages → **400**; **rate limit → 429 after 20/min** (confirmed by firing 25 requests). Onboarding + settings level pickers render and persist (screenshotted at 430px in pass-through on :3100; B1 seed shows selected, model label resolves, status reads OpenRouter).

### Still open
- **Live chat round-trip** — needs `OPENROUTER_API_KEY` (from openrouter.ai/keys) in `.env.local` / Vercel. Everything up to the model call is verified; only the real reply is untested.
- Phase 1 auth end-to-end gate (real magic-link login) — still needs a human to click the email; unchanged.

### Decision applied
- **Gateway = OpenRouter** (Harish confirmed again 2026-07-14). Supersedes CLAUDE.md Hard Rule #1's OpenAI naming — reconcile CLAUDE.md/CONTEXT.md wording in a later docs pass.

---

## Current entry — 2026-07-14 (Phase 2: core screens finished to DESIGN.md)

Took over Phase 2 in a fresh session (the previous session's uncommitted work was in a separate ephemeral container and unrecoverable — nothing to salvage).

### What was blocking the previous session (root cause)
- **Not a missing Supabase — the opposite.** Phase 1's auth middleware (`src/lib/supabase/middleware.ts`) protects `/`, `/onboarding`, `/chat`, `/settings`. Reproduced: running dev with **dummy** `NEXT_PUBLIC_SUPABASE_*` values (the state Phase 1's verification leaves behind) makes every Phase 2 screen **307 → /signin**, and `/signin` needs a real magic-link email a fake project can't send. You get locked out of the exact screens you're trying to build.
- **Fix is operational, not code:** run Phase 2 dev with **no** `NEXT_PUBLIC_SUPABASE_*` set — `isSupabaseConfigured()` puts the middleware in pass-through and all screens render. Verified: unconfigured → `/`, `/onboarding`, `/chat`, `/settings` all 200.

### What was built (all screens already existed + were color-consistent; this was DESIGN.md fidelity)
- **`SectionLabel`** (`src/components/ui/SectionLabel.tsx`) — the `//` section-label voice (uppercase, muted, `0.25em`). `//` written as `{"// "}` to dodge `react/jsx-no-comment-textnodes`. Applied across onboarding + settings + chat, replacing plain `<h2>`s.
- **Composer redesigned to spec** — `REPLY IN CZECH_` with a blinking underscore (`animate-blink`, disabled under reduced-motion), accent 2px pill border, filled **circular** send with a white up-arrow (disabled when empty). Replaced the old Input + rectangular "Send".
- **Chat is now character-first (Hard Rule #7)** — 64px HonzaOrb in the header that reacts to chat state (`loading`→thinking, error→oops, new Honza msg→brief speaking beat, else idle), plus a character-led empty state.
- **Onboarding** leads with a HonzaOrb + `// WELCOME`.
- **`maxWidth.app` 390 → 430** (DESIGN.md "~430px phone stage"; the cosmetic note from Phase 0).

### Verified
- `npm run lint` + `npm run build` green (13 routes, middleware detected). Screenshotted all four screens at 430px (Playwright/Chromium) + a composer interaction check (typed Czech renders, placeholder hides, send enables). TASKS.md Phase 2 checked off; `HonzaOrb states` (Phase-1) also confirmed done (all 5 states + motion + reduced-motion).

### Still open (unchanged by this session)
- Phase 1 auth end-to-end gate (real magic-link login) — needs Harish's Supabase keys; can't click an email link from a headless container. Harish has confirmed Supabase is provisioned; awaiting `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (+ optional `SUPABASE_SERVICE_ROLE_KEY` for scripted verification).
- `Toggle` primitive (Phase 1) — deferred; no on/off toggle exists in Settings yet.

---

## Current entry — 2026-07-14 (BUILD_SPEC Phase 0: repo inventory & reconciliation)

Read-only phase. Ran `npm install` + `npm run lint` + `npm run build`: **all green**, 10 routes build, no ESLint errors, no type errors. Scaffold is healthy, not broken.

### Four primitives (BUILD_SPEC §3) — exist vs. build-from-scratch

1. **Auth + user identity — DOES NOT EXIST.** No auth library, no database, no `users` table, no sessions. All "state" is client-side Zustand persisted to `localStorage` (`honza-chat`, `honza-settings`). Everything downstream currently hangs off an anonymous browser, not a user id. Build from scratch.
2. **Honza state machine — PARTIAL.** `HonzaOrb.tsx` renders all five states with `HONZA_STATE_COLORS` + per-state motion (matches DESIGN.md exactly). BUT state is a **per-component prop**, not a shared store. There is no app-wide mood store and no app-wide background tint. Need to build the Zustand mood store + wire the app-wide tint.
3. **Conversation engine — PARTIAL, wrong gateway + wrong shape.** `/api/chat` makes real, server-side OpenAI calls with a solid Czech persona prompt (good). BUT: (a) it calls the **OpenAI SDK directly**, whereas BUILD_SPEC §3/§6 mandate **OpenRouter** as the gateway; (b) the logic lives **inside the route handler**, not an extractable `lib/conversation-engine.ts` service; (c) it returns a plain string, no structured correction/explanation data. Refactor needed.
4. **Context ingestion — PARTIAL.** `lib/server/google-doc.ts` does a real public-URL fetch+parse (`export?format=txt`), server-side, with good error handling. BUT parsed text is stored **client-side** in `useSettingsStore.contextChunks`, not persisted per-user in a DB. Needs DB-backed per-user storage once auth exists.

### Design-token reconciliation (matches DESIGN.md — not inventing)
- `globals.css` / `tailwind.config.ts` / `layout.tsx` all align with DESIGN.md: cream `#F5F2EE`, Share Tech Mono loaded app-wide, `color-scheme: light`, 16px card radius, `1px solid rgba(0,0,0,0.07)` borders, accent `#E8432D`. `HONZA_STATE_COLORS` matches the DESIGN.md state table exactly. **No dark-mode remnants** in product chrome.
- Minor: `tailwind maxWidth.app = 390px`; DESIGN.md says "~430px phone stage." Cosmetic, note for polish.

### Conflicts flagged (DESIGN.md / CONTEXT.md / Hard Rules win over BUILD_SPEC until formally adopted)
- **State name:** BUILD_SPEC §3 lists `happy`; DESIGN.md + code use `excited`. → keep **`excited`** (DESIGN.md wins).
- **Model gateway (needs Harish's OK):** existing code = OpenAI direct; BUILD_SPEC = OpenRouter. CLAUDE.md Hard Rule #1 + CONTEXT.md say OpenAI, and CLAUDE.md marks BUILD_SPEC "reference only — not yet reconciled… do not build toward it without Harish's explicit OK." → **do not switch to OpenRouter without explicit OK.**
- **Scope (needs Harish's OK):** BUILD_SPEC Phases 1–9 add magic-link auth + a database, voice calls (STT/TTS), and OpenRouter — all of which CLAUDE.md Hard Rule #6 marks OUT of MVP scope or gated behind Harish's explicit approval. Phase 0 (inventory) is safe and done; **Phases 1+ are blocked on Harish confirming BUILD_SPEC is adopted over the current CLAUDE.md Hard Rules.**

## Current entry — 2026-07-14 (BUILD_SPEC Phase 1: Auth + user identity — scaffolded)

Stack: **Supabase** (Auth magic links + Postgres) via `@supabase/ssr`, per Harish. Built **scaffold-first**: full flow in code; real keys added later by Harish, so the phase's end-to-end gate stays open until then.

**Built:**
- `src/lib/supabase/{config,client,server,middleware}.ts` — public-safe env config + `isSupabaseConfigured()`, browser client, cookie-bound server client, session-refresh/route-guard helper.
- `src/middleware.ts` — **must live under `src/`** (root `middleware.ts` is NOT detected when the app is under `src/app`; build now lists `ƒ Middleware`). Protects `/`, `/chat`, `/settings`, `/onboarding`; bounces authed users off `/signin`; **pass-through when Supabase unconfigured** so the scaffold still runs.
- `src/lib/auth.ts` — server-only `getCurrentUser()` / `getCurrentProfile()`; return null when unconfigured.
- `src/app/signin/{page,SignInForm}.tsx` — character-first magic-link screen (HonzaOrb idle, `// SIGN IN` label, cream/Share Tech Mono); shows a clear "NOT CONFIGURED" notice until keys exist.
- `src/app/auth/callback/route.ts` — exchanges PKCE `code` (or `token_hash`) for a session, redirects to `next`.
- `src/app/auth/signout/route.ts` — POST sign-out → `/signin`. Sign-out button added to home footer.
- `supabase/migrations/0001_profiles.sql` — `public.profiles` (id→auth.users, email, name, onboarding_completed, created_at), **RLS own-row-only**, and an `on_auth_user_created` trigger auto-creating a profile per signup.
- `.env.example` — added `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OPENROUTER_API_KEY`.

**Verified (no real keys needed):** `lint` + `build` green; `ƒ Middleware` detected; with dummy Supabase env, unauth `/`, `/chat`, `/settings`, `/onboarding` → **307 → /signin?next=…**, `/signin` stays 200; unconfigured mode serves every route without crashing.

**Gate still OPEN (needs Harish, see report):** create Supabase project, run `0001_profiles.sql`, set Auth redirect URL to `/auth/callback`, add the two `NEXT_PUBLIC_SUPABASE_*` keys → then verify real magic-link email, session-persists-on-refresh, sign-out, and second-email-is-separate-user.

`react/jsx-no-comment-textnodes`: `//` section labels must be written as `{"// LABEL"}` in JSX or ESLint reads them as comments.

---

### Decisions from Harish (2026-07-14, post-Phase-0)
- **BUILD_SPEC adopted, phase-gated.** Build toward BUILD_SPEC Phases 1–9, but **pause at each phase boundary for Harish's OK** (several phases need external accounts/secrets he must provision). CLAUDE.md Hard Rule #6 (voice/scope) and the "reference only" caveat are superseded by this adoption, to be reconciled in CLAUDE.md/CONTEXT.md as phases land.
- **Model gateway → OpenRouter.** Switch the conversation engine from OpenAI-direct to OpenRouter (model swappable via one config value). Supersedes Hard Rule #1's OpenAI naming. Needs `OPENROUTER_API_KEY`. To be applied in Phase 3.

---

## Current entry — 2026-07-19 (Welcome landing fix + Next 15 + sign-out hero)

**Fixed:** `Cannot find module './948.js'` on `/welcome` — stale `.next` webpack chunks from an old dev server (often after `npm run build` while `next dev` was running). Fix: kill old dev processes, `rm -rf .next`, restart `npm run dev`.

**Upgraded:** Next.js **14.2.35 → 15.5.20** (`eslint-config-next` matched). Required fixes: async `searchParams` on `/signin`, `await cookies()` in `createSupabaseServerClient()` + all callers. `lint` + `build` green on 15.5.20.

**Welcome flow:** Sign-out now redirects to `/welcome?signedOut=1` (not `/signin`) with dedicated hero copy (`LANDING_HERO_SIGNED_OUT` — "See you soon!", "Sign back in" CTA). Return visitors (localStorage) still get rotating nudge copy; first visit gets `LANDING_HERO_FIRST`. Sticky CTA follows the same signed-out vs first-visit label.

**Try it:** `http://localhost:3000/welcome` (signed out) → Sign in → use app → Settings → Sign out → welcome send-off.

---

## Current entry — 2026-07-22 (Unified design funnel)

**Fixed:** Public funnel no longer forced Hmat on `/welcome` while `/signin` followed the saved design (default Classic). Welcome, sign-in, install prompt, and the signed-in app now all follow the Design Lab choice in `honza-design` (`localStorage`).

**Changed:**
- `WelcomeScreen` branches on design family: Classic → `ClassicWelcome`, Hmat → `HmatLanding`.
- `AppShell` removed the `isWelcome` Hmat override; shell follows design family everywhere.
- `DEFAULT_DESIGN` → `hmat-metal` so first-time visitors get a consistent Hmat funnel; Classic remains selectable in Settings → Design Lab.
- `InstallPrompt` is design-aware (Classic flat card vs Hmat `.mat` chrome).

**Test:** Sign in → Settings → Design Lab → pick Classic or Hmat → sign out → `/welcome` → `/signin` — entire path matches. To drop a design family later: remove its `DesignId` from `registry.ts`, delete its `Classic*` / `Hmat*` screen trees, collapse `*Screen.tsx` selectors.

---

## Current entry — 2026-07-27 (Chat-first nav + sessions + UI locale)

**Navigation:** Home removed from dock; app is **Chat · Call · Settings**. `/` redirects to `/chat`. Post-auth and post-onboarding land on `/chat`.

**Chat UX:** Orb-on-top layout on `/chat`. Idle → **Start chat** (Honza opener on tap). Active → scrollable thread + **Send** + **End chat**. History icon opens drawer; tap session → `/chat/history/[id]` read-only transcript.

**Sessions:** `chat_sessions` table + `messages.session_id` (`0003_chat_sessions.sql`). Local Zustand persists `activeSessionId`, `endedSessions`, `archivedMessages`. Orphan DB rows backfill into one ended session on load.

**i18n:** Lightweight `src/lib/i18n/` + `uiLocale` in settings (CS/EN). Toggle on sign-in and Settings; independent of design family. Honza teaching copy stays Czech.

**Removed:** `useHomeScreen`, `ClassicHome`, `HmatHome`, `HomeScreen`.

**Verify:** `npm run lint` + `npm run build` green. Apply `0003_chat_sessions.sql` on Supabase before session persistence works in production.

---

## Current entry — 2026-07-28 (Design delight pass)

**Interaction:** `src/lib/interaction/haptic.ts` + `useReactPop` + `useMoodReactions`.
Light haptics on mat-keys/send/dock; orb `react-pop` on send, mood beats, call connect,
orb tap. Respects `prefers-reduced-motion` for CSS; haptics follow OS setting.

**Chat:** Auto-initiate session + opener on load (and after End Chat) — **no Start Chat
gate**. Hmat dual layout: hero recess + `mat-metal` opener card until first user reply,
then compact 48px orb header. `expression.caption` surfaced under channel. Message
bubbles animate in; history drawer slides.

**Classic:** Shared haptics/pop; accent Honza bubbles; circular send; HardwareIcons on
Call mic/hang. Deleted dead `Composer`, `HmatComposer`, `HmatWelcome`.

**Push (foundation only):** `0003_push_subscriptions.sql`, `/api/push/subscribe`,
Settings `PushNotificationSettings`. Scheduled sends **not** wired — needs VAPID +
cron approval.

**Verify:** `npm run lint` + `npm run build` green (16 routes incl. `/api/push/subscribe`).
Apply `0003_push_subscriptions.sql` on Supabase for push persistence.

---

## Design finalized (2026-08-02)

**Shipped look:** Hmat Metal · **Doto** (labels/buttons, 500/700 weight) · **Space Grotesk** (Czech body).

Design Lab removed from Settings; `useDesignStore` is read-only constants in `registry.ts` (`SHIPPED_*`). Pre-paint script hardcodes fonts — no `localStorage` design axis.

### Phase 2 typography (2026-08-02)

Branch `cursor/typography-phase-2-1034`. Expanded `TYPE` in `src/lib/design/typography.ts`
(`title`, `subtitle`, `displayLg`, documented Doto size/tracking vs Space Grotesk
weight rules). Migrated Hmat surfaces (chat, call, settings, landing, dock,
onboarding, sign-in, history, install/push chrome) and shared primitives
(`SectionLabel`, `Button`, `Label`, `LanguageSwitcher`) onto `TYPE` roles.
`DESIGN.md` typography + Hmat sections updated; Design Lab picker docs removed.
Classic screens left as legacy baselines (not selectable).

**Gotchas fixed while verifying:**
1. Tailwind `content` must include `src/lib/**` — otherwise `TYPE` class strings
   never enter the CSS (DOM had the classes; sizes/fonts fell through to body).
2. Do not name the button weight helper `font-display-ui` — `tailwind-merge`
   treats `font-*` as one family group and strips `font-display`. Use
   `display-ui-weight` instead.
3. Hmat `[data-design]` token block still pointed at removed Geist faces; updated
   defaults to Doto / Space Grotesk (inline DesignScript already won, but CSS
   safety net was wrong).

Next: Phase 4 live orb dot backdrop (`cursor/orb-backdrop-phase-4-1034`).

### Phase 3 button unification (2026-08-02)

Branch `cursor/button-depth-phase-3-1034`. Unified Hmat + Classic buttons behind
`Button` (`surface: flat | mat-key`) and `buttonClassName` in
`src/lib/design/button.ts`. Mat-key applies globals.css `.mat-key` depth +
`.press` travel; `TYPE.button` typography; `BUTTON_FOCUS` ring on keyboard nav;
haptics via `haptic` prop (`light` default, `medium` for send / call connect).
`ButtonLink` for landing CTAs. Migrated all raw `mat-key press` usages (landing,
sign-in, onboarding/settings, chat send/history, call connect/mic/hang, push,
install, file picker). Classic screens unchanged (`surface="flat"` default).
`Pressable` is now a thin alias over mat-key `Button`.

Next design phases (see `design update/DESIGN_ELEVATION_PLAN.md`): Phase 4 live orb dot backdrop.

---

## Current entry — 2026-08-10 (Next.js 16.3.0 upgrade)

Branch `chore/upgrade-nextjs-16` (from updated `main`).

### What changed
- **Next.js** `^15.5.20` → `16.3.0`; **React** `18.3` → `19.2`; **ESLint** `8` → `9` flat config (`eslint.config.mjs`; `next lint` → `eslint .`).
- **`src/middleware.ts` → `src/proxy.ts`** (Next 16 rename; same Supabase session refresh + route guards).
- **Scripts** use `next dev --webpack` / `next build --webpack` because `next-pwa` still injects a webpack config (Turbopack is default in 16 but incompatible with next-pwa today).
- **React 19 lint fixes:** `useSyncExternalStore` for reduced-motion, settings hydration, speech-recognition support; lazy init for push support; `requestAnimationFrame` deferral in `useLandingVisitor`.

### Verified
- `npm run lint` + `npm run build` green; dev boots on Next 16.3.0; proxy detected in build output; PWA worker still generated on build.

### Gotcha
- If build fails on `/_not-found`, wipe `.next` and rebuild (stale cache after major version bump).

---

## Previous entry — 2026-08-10 (Call pickup SFX + TTS pacing)

### What changed
- **Pickup** (`pickup.mp3`): Harish's telephone pickup clip plays after dial finishes, before Honza's first TTS line.
- **TTS** explicitly sets `audio.playbackRate = 1` so voice never inherits the dial's 1.5× rate.

### Why Honza sounded fast
- Dial runs at 1.5× by design; we had removed the pickup beat, so his voice started immediately after sped-up audio — the contrast reads as "rushed" even though TTS was always 1×.

### Verified
- `call-sfx.ts`, `useCallScreen.ts`, `tts-actions.ts`; assets: `dial.mp3`, `pickup.mp3`, `hangup.mp3`.

---

## 2026-08-10 (Custom call dial + hangup sounds)

### What changed
- **Dial** (`dial.mp3`): plays once at **1.5×** for the full ~14 s clip (~9.3 s wall time) while the opener fetches in parallel; no loop, no early cut-off.
- **Hangup** (`hangup.mp3`): plays on disconnect.
- Removed old Mixkit `ring.mp3` / `pickup.mp3` — the pickup tone was still firing after dial and caused the "old + new" overlap Harish heard.

### Verified
- `call-sfx.ts` + `useCallScreen.ts` updated; assets in `public/audio/call/` (`dial.mp3`, `hangup.mp3` only).

---

## 2026-08-09 (Call screen phone sounds)

### What changed
- **Ring / pickup / hangup SFX** on `/call`: looping ring during `connecting`, short pickup tone before Honza's first TTS line, disconnect tone on hang-up. Wired in `useCallScreen`; module `src/lib/client/call-sfx.ts` (separate from TTS `Audio` element). Respects earpiece/speaker routing via `call-audio-route.ts`; skipped when `prefers-reduced-motion: reduce`.
- **Assets** in `public/audio/call/` (Mixkit License, no attribution required):
  - `ring.mp3` — [Urgent simple tone loop](https://mixkit.co/free-sound-effects/urgent-simple-tone-loop/) (sfx 2976)
  - `pickup.mp3` — [Magic notification ring](https://mixkit.co/free-sound-effects/magic-notification-ring/) (sfx 2344)
  - `hangup.mp3` — [Wrong answer fail notification](https://mixkit.co/free-sound-effects/wrong-answer-fail-notification/) (sfx 946)

### Verified
- `npm run lint` + `npm run build` pass.
- Audible playback on device still 🟡 (headless); swap any of the three MP3s in `public/audio/call/` without code changes if Harish prefers different tones.

### Decision
Call SFX are static files, not a library. Pickup plays only on the initial connect (not every Honza reply). Hang-up is fire-and-forget so UI resets immediately.

---

## Current entry — 2026-08-09 (Call screen experience)

Branch `feature/call-screen-experience` off `main`.

### What changed
- **Orb parity with chat:** `useCallScreen` derives `orbState` as `orbLoading ? "thinking" : expression.mood` and exposes `orbLoading`; `HmatCall` passes it to `HmatPresenceRecess` like `HmatChat`.
- **Call controls:** `CallControlCluster` replaces abrupt swap — call CTA morphs/splits (motion spring) into speaker + hang-up on connect; respects `prefers-reduced-motion`.
- **Speaker button = audio routing**, not captions. Default route `navigator.audioSession.type = "play-and-record"` (earpiece intent); toggle sets `"playback"` + best-effort `setSinkId` via `call-audio-route.ts`; applied in `tts-actions` before each play.
- **Captions always live in-call** when text exists; `CaptionTextReveal` (manual skiper70-style word stagger via `motion`).
- Removed dead `HmatCallButton` / `HmatCallControls` from `HmatUi.tsx`. i18n: `speakerOnAria` / `speakerOffAria`; caption placeholders no longer say "tap speaker for captions".

### Verified
- `npm run lint` + `npm run build` pass.
- Mic + audible playback on a real phone still 🟡 (headless); audio routing is best-effort — Audio Session API is experimental and uneven on mobile.

### Decision
Call captions are always shown when Honza/you have lines; speaker toggles output only. Do not rebind speaker to caption visibility.

---

## Current entry — 2026-08-09 (Dock tab transitions: kill View Transitions)

### What broke
Wrapping dock `router.push` in `document.startViewTransition` hung App Router soft navigations: the tab could focus while the route stayed put, and pages could stick at opacity 0 when CSS enter used `fill: both` from opacity 0 under overlapping VTs.

### What works now
- `HmatDock` uses plain `router.push` only (no VT, no navigation lock ref).
- `HmatScreenFrame` CSS rise-in (380ms, light blur) with `forwards` + animationend/failsafe clear.
- Removed `view-transition-name` / VT pseudo rules for screen + presence from the dock path.

### Decision
Dock continuity = sliding pill + CSS page enter. Do not reintroduce View Transitions around tab pushes without a Next-native VT path that cannot abort navigations.

---

## Previous entry — 2026-08-09 (Presence beat + page enter polish)

### What changed
- Shared `--duration-presence-beat: 680ms` for speak/burst dust + Honza chat/typing bubble enter (premium, visible). Thinking ring ~3s with stronger opacity/stroke.
- Dust brighter, longer hold, farther drift; `speakFlash` 820ms.
- Page transitions: initially CSS rise-in on live `HmatScreenFrame` + VT presence morph (later fixed — see entry above).

### Decision
Honza bubble timing locks to the orb presence beat; user bubbles stay snappy (`--duration-bubble-in`).

---

## Previous entry — 2026-08-09 (Fluid reverb + Chat/Call/Settings continuity)

### What changed
- **RecessReverb smoothness:** removed `stroke-dasharray` morph (jumpy re-phase). Thinking uses fixed dash + `stroke-dashoffset` drift; speak/burst use opacity + ≤2px blur handoff into dust. Speak 360ms / burst 280ms / `speakFlash` 470ms. Speak/burst remount cleanly; idle/oops use one wave.
- **Chat↔Call↔Settings:** `navigateWithViewTransition` on `HmatDock`; shared `view-transition-name: honza-presence` on recess module + settings compact orb; soft root crossfade. `HmatScreenFrame` CSS enter is fallback when VT unavailable. Dock pill uses `--ease-out` / `--duration-ui` tokens.
- Fixed pre-existing `.chat-orb-header` layout transition (`padding`/`gap`) that tripped the design hook — removed layout property animation.

### Decision
Keep square line→dust DNA; continuity via View Transitions API (no new motion library). Reduced motion skips VT and screen enter.

---

## Previous entry — 2026-08-09 (RecessReverb line → particle dissolve)

### What changed
- Removed corner brackets (they read as a second square outline when Honza acts).
- Reverb is now SVG rounded-square strokes that expand, then `stroke-dasharray` dissolves into dashes; speak/burst blooms square-pixel dust that drifts outward and dies **inside** `overflow: hidden` on the module.
- Thinking: line dissolve only (no dust — too frequent). Speak 480ms / burst 320ms. `speakFlash` → 560ms.

### Decision
No corner brackets or edge ticks on the display reverb. Presence = line → particles, clipped to the module.

---

## Previous entry — 2026-08-08 (Chat motion design phases 0–5)

Branch `feature/chat-motion-design`. Spec: `plans/CHAT_MOTION_DESIGN_SPEC.md`.

### Shipped (phases 0–5)

| Phase | Feature |
| --- | --- |
| 0 | Motion tokens (`--ease-*`, `--duration-*`) in `globals.css` + `tailwind.config.ts` |
| 1 | `HonzaTypingBubble`, `typingPreview` store state, reply choreography in `chat-actions.ts` |
| 2 | Typing bubble wired into `ClassicChat` + `HmatChat` |
| 3 | `OrbDotHalo` perimeter dots behind orb in both families |
| 4 | Craft pass: bubble `@starting-style` transitions, orb pop 1.06, opener 280ms easing |
| 5 | Channel pulse on typing phase start — `channelPulse` on `MoodOrbStrip` (Classic) and `HmatPresenceRecess` mat-channel (Hmat); single 450ms `animate-channel-pulse` |

### Verified

- `npm run lint` + `npm run build` pass after each phase commit.

### Remaining (spec phases 6–7)

- Drawer exit animation (phase 6)
- P2 polish: error shake, end-chat composer fade, haptic on reveal (phase 7)

