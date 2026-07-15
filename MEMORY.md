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
| **No font-weight utilities above 400 in product chrome** (2026-07-15) | Share Tech Mono ships weight 400 only, so `font-semibold`+ renders as browser-synthesized faux bold and breaks the dot-matrix voice. `font-medium` (500) is inert — it renders identically to 400 — so it's tolerated where it already exists. Use size, tracking, and color for hierarchy instead. |

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

## Current entry — 2026-05-12

- Scaffold built with **Next.js 14**, **Tailwind**, **Zustand**, **next-pwa**.
- **localhost** run confirmed; repository files created as expected.
- **API key architecture:** environment variables on Vercel (and local env for development); **Route Handlers** as the only LLM proxy.
- **Google Doc strategy:** fetch from **public URL**; **no OAuth** in MVP.
- **Design system rebuilt:** Nothing OS dot matrix style, **Share Tech Mono** font, cream background, character-first layout, full-screen mood shifts with Honza’s `state` (`idle` / `thinking` / `speaking` / `oops` / `excited`); see `DESIGN.md` and `HONZA_STATE_COLORS` in `HonzaOrb.tsx`.
