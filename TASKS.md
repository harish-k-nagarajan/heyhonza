# Honza — build order (`TASKS.md`)

Use this file as the **session checklist**: work top to bottom within a phase unless dependencies say otherwise. Tags: **`[independent]`** = can start anytime; **`[depends on: …]`** = blocked until that task is done.

---

## Phase 0 — BUILD_SPEC repo inventory & reconciliation (read-only)

- [x] **Repo inventory + baseline build** — read CONTEXT/DESIGN/TASKS/MEMORY + all `src/` primitives; `npm install` + `lint` + `build` all green. Findings recorded in `MEMORY.md` (2026-07-14 entry). `[independent]`
- [x] **Primitive status stated** — auth (none), Honza state store (partial: component yes, shared store no), conversation engine (partial: OpenAI not OpenRouter, in-route not service), context ingestion (partial: fetch yes, per-user DB no). `[independent]`
- [x] **Design tokens confirmed vs DESIGN.md** — cream/Share Tech Mono/state colors all match; no dark remnants. `[independent]`
- [x] **BUILD_SPEC adoption decision** — Harish (2026-07-14): adopt BUILD_SPEC **phase-gated** (confirm each phase boundary); switch model gateway to **OpenRouter**. See MEMORY.md. `[done]`

---

## BUILD_SPEC Phase 1 — Auth + user identity (Supabase, scaffold-first)

- [x] **Supabase clients + config** — browser/server/middleware clients, `isSupabaseConfigured()` gate. `[done]`
- [x] **`profiles` table + RLS + signup trigger** — `supabase/migrations/0001_profiles.sql`. `[done]`
- [x] **Middleware session refresh + route protection** — `src/middleware.ts`; verified 307→/signin with dummy env. `[done]`
- [x] **Sign-in screen + callback + signout** — `/signin`, `/auth/callback`, `/auth/signout`. **Switched from magic link to email+password with email confirmation (Harish, 2026-07-15)** — see MEMORY.md §3 for why. `/auth/callback` is unchanged and now serves the sign-up confirmation link. `[done]`
- [x] **Headless dev sign-in** — `scripts/dev-signin.mjs`: mints a sign-in token via Supabase admin `generate_link` (**sends no email, so no ~2/hr cap**) and prints an `/auth/callback?token_hash=…` URL redeemable in any browser. Needs `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (gitignored, never imported by `src/`). Retires the old PKCE/SQL-token dance. `[done]`
- [x] **End-to-end gate** — **verified:** magic-link login → session, profile trigger fired, sign-out clears (`persisted:false`), RLS rejects anon writes, routing correct. **Password sign-up → confirm → sign-in verified by Harish** on `harishnokia@gmail.com` (2026-07-15). **Second user = separate empty record verified 2026-07-15:** user B signed in right after user A in the same browser → `persisted:true`, 0 messages, 0 context chars, no doc bleed. Email cap unblocked via `scripts/dev-signin.mjs` (admin `generate_link`, sends no mail). `[done]`

---

## Phase 1 — Scaffold and design system

- [x] **Next.js 14 App Router + TypeScript project** — `src/app`, strict typing, ESLint. `[independent]`
- [x] **Tailwind + global dark tokens** — background, surface, accent, text, borders. `[independent]`
- [x] **Inter (`latin` + `latin-ext`) + root metadata/viewport** — PWA-ready HTML shell. `[depends on: Next.js 14 App Router + TypeScript project]`
- [x] **Zustand stores (chat, settings)** — persisted or hydrated patterns as designed. `[independent]`
- [x] **next-pwa** — `next.config.js`, manifest, generated worker in `public/`. `[independent]`
- [x] **Base UI primitives** — `Button`, `Card`, `Input`, `Label`, `Textarea`. `[depends on: Tailwind + global dark tokens]`
- [x] **Layout shell** — `AppShell`, `BottomNav`, mobile-first max width. `[depends on: Base UI primitives]`
- [ ] **Toggle component** — a11y, keyboard, 999px pill track per `DESIGN.md`. **Deliberately deferred, not a gap:** no screen has an on/off toggle (level/topics are pills, model is a select), so building it now would be an unused component. Build it when a real toggle appears. `[depends on: Base UI primitives]`
- [x] **HonzaOrb states** — idle / thinking / speaking / oops / excited motion + reduced-motion path; all five states render with per-state keyframes and a 200ms crossfade. `[depends on: Layout shell]`
- [x] **Token audit** — done in the BS-Phase-9 polish pass. Swept for legacy dark-mode leftovers: no `dark:` classes, no Inter in product chrome, no stray palettes (remaining hard-coded hex are static `icon.tsx` / `themeColor` / BottomNav's canonical cream, which can't read CSS vars). Fixed: `Card`'s `shadow-black/40` → `shadow-black/[0.04]` (a 40%-black shadow read as grime on cream), and the two `font-semibold` headings — Share Tech Mono ships weight 400 only, so 600 was rendering as browser-synthesized faux bold (verified in-browser: 400 and 500 are pixel-identical, 600 visibly thickens). `font-medium` left alone deliberately: it renders identically to 400. `[depends on: Tailwind + global dark tokens]`

---

## Phase 2 — Core screens (onboarding, home, chat, settings)

- [x] **Routes wired** — `/`, `/onboarding`, `/chat`, `/settings`. `[depends on: Layout shell]`
- [x] **Onboarding** — topic select, Google-Doc/file/paste context, validation, completion flag, routes to home; now character-first (leads with HonzaOrb) with `//` section labels. `[depends on: Routes wired]` + `[depends on: Zustand stores (chat, settings)]`
- [x] **Home** — leads with hero HonzaOrb (idle), "open chat" entry, sign-out. `[depends on: HonzaOrb states]` + `[depends on: Routes wired]`
- [x] **Chat** — message list, redesigned composer, empty/loading/error states, Honza vs user bubble styling; character-first header with a HonzaOrb that reacts to state (idle/thinking/speaking/oops). `[depends on: Routes wired]` + `[depends on: Zustand stores (chat, settings)]`
- [x] **Settings** — model select, topics, Google-Doc/file/paste context list, server-status card, reset; `//` section labels throughout. (No on/off Toggle needed yet — current controls are pills + select; the a11y Toggle primitive stays a Phase-1 task for when a real toggle appears.) `[depends on: Zustand stores (chat, settings)]`
- [x] **Navigation polish** — dot-indicator bottom nav, onboarding gate on first visit (client redirect when `onboardingComplete` is false), real route deep links. `[depends on: Onboarding]`

---

## Phase 3 — AI integration via Route Handlers

- [x] **`/api/chat` Route Handler** — thin route over `lib/server/conversation-engine.ts`; gateway is **OpenRouter** (OpenAI-compatible SDK + `OPENROUTER_API_KEY`). `[independent]`
- [x] **`/api/context/google-doc` + server helper** — public URL fetch, no OAuth. `[independent]`
- [x] **`/api/health`** — reports `{ provider: "openrouter", llmConfigured }`. `[independent]`
- [x] **Chat API hardening** — JSON/message validation + caps, per-request 30s timeout, typed `EngineError` → friendly status/message (401/403→auth, 429→busy, timeout→504, 503 not-configured). Streaming intentionally deferred (not needed for MVP). `[depends on: /api/chat Route Handler]`
- [x] **Honza persona + system prompt** — level-aware (A1–B2): vocabulary + correction depth scale with CEFR level; tutor loop (correct → explain briefly → continue). Level set in onboarding + settings, threaded through to the prompt. `[independent]`
- [x] **Client ↔ API wiring** — ChatClient sends model/topics/level/context + history, applies assistant messages to the store, bootstrap opener, loading/error states. `[depends on: Chat API hardening]` + `[depends on: Chat]`
- [x] **Context injection** — `buildLearnerContextText` merges Google-Doc/file/paste chunks into the system prompt (capped at 48k chars). `[depends on: /api/context/google-doc + server helper]` + `[depends on: Client ↔ API wiring]`
- [x] **Rate limiting / abuse basics** — in-memory fixed-window limiter (20/min per client key) in `lib/server/rate-limit.ts`; soft guard on serverless, verified returning 429. `[depends on: Chat API hardening]`
- [x] **Live end-to-end chat verification** — real OpenRouter reply round-trip **confirmed** (2026-07-14, local, key in `.env.local`): bootstrap opener returns Czech; a user turn triggers correct→explain→continue on `openai/gpt-4o-mini`. `/api/health` → `llmConfigured:true`.

---

## Phase 4 — PWA polish and Vercel deploy

- [x] **Icons + maskable assets** — real dot-matrix Honza face PNGs generated from the idle `HonzaOrb` (`scripts/generate-icons.mjs`); manifest now has separate `any` (full-bleed) + `maskable` (safe-zone) icons; `apple-touch-icon.png` (180, opaque) + `icons`/`apple` meta wired in `layout.tsx`. Replaced the 1×1 placeholder stubs. `[independent]`
- [x] **Install prompt UX** — 4s reveal delay, dismissal persisted 14 days (`honza-install-dismissed-at`), already-installed detection (`display-mode: standalone` / `navigator.standalone` / `appinstalled`), iOS-Safari manual "Add to Home Screen" hint; styled to DESIGN.md (`// INSTALL`). Verified at 430px. `[depends on: next-pwa]`
- [x] **Service worker behavior** — `skipWaiting`+`clientsClaim`, `buildExcludes` middleware/app-build manifests, `cacheOnFrontEndNav`, `reloadOnOnline`, `dynamicStartUrl:false` (start URL is auth-gated). Verified in generated `public/sw.js`. `[depends on: next-pwa]`
- [ ] **Vercel project** — production branch `main` + env vars (`OPENROUTER_API_KEY` server-only, `HONZA_DEFAULT_MODEL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). **`SUPABASE_SERVICE_ROLE_KEY` must NOT be added** (local-dev-only, bypasses RLS — called out in `DEPLOY.md` §1). Runbook in `DEPLOY.md`. `[blocked on: Harish's Vercel account + secrets — Claude can't create the project or enter keys]`
- [ ] **Custom SMTP (production email)** — **genuine launch blocker:** the built-in sender caps at ~2 emails/hour and isn't for production, so real learners can't receive the confirmation email that email+password auth needs. **Click-by-click runbook written** in `DEPLOY.md` §4 (Resend free tier → Supabase Authentication → Emails → SMTP Settings). Not a testing blocker — `scripts/dev-signin.mjs` sends no email. `[blocked on: Harish's Resend account + a domain he controls + Supabase dashboard — Claude can't verify a domain or enter the SMTP key]`
- [~] **Production verification** — live round-trip **verified locally** against real OpenRouter (chat correct→explain→continue; `/api/health` llmConfigured; google-doc route validates 400 + fails gracefully 422 — 200 happy path needs a real public doc). **Remaining:** re-run the same checks on the deployed Vercel URL. `[blocked on: Vercel project]`

---

## BUILD_SPEC Phase 2 — Honza state machine (shared mood store + app-wide tint)

- [x] **`honza/theme` module** — extracted `HONZA_STATE_COLORS` + `HonzaOrbState` out of the component so a store can import the palette; `HonzaOrb` re-exports for back-compat. `[independent]`
- [x] **`useMoodStore`** — single Zustand source of truth for Honza's mood (`idle/thinking/speaking/oops/excited`) with `setMood` + `flashMood` (one-shot beat → idle). Not persisted (ephemeral). `[independent]`
- [x] **App-wide tint** — `AppShell` reads the mood store and sets the tinted background **and** `--accent` custom property on the wrapper, so accent UI (borders/buttons/links/composer) recolors app-wide. **Verified live at 375px.** `[depends on: useMoodStore]`
- [x] **Chat + Home drive the store** — chat-actions set `thinking`/`speaking`/`oops`; both surfaces' orbs read the shared mood. `[depends on: useMoodStore]`
- [x] **Dev-only mood cycler** — `MoodCycler` cycles all 5 states; gated behind `NEXT_PUBLIC_HONZA_DEV_TOOLS=1` (compiles to `null` in a normal build, unreachable by real users). `[independent]`

---

## BUILD_SPEC Phases 4/5/6 — Per-user DB persistence

- [x] **Migrations `0002_conversations_and_context.sql`** — `messages` (per user, `kind` chat/call) + `user_context` (source, content, `synced_at`), RLS own-row-only; settings columns (`level`, `topics`, `preferred_model`) on `profiles`. `[independent]`
- [x] **Server data layer** — `src/lib/server/user-data.ts`: load/insert messages, load/patch profile, add/remove context, reset; all no-op/null when unconfigured or signed out. `[depends on: migrations]`
- [x] **`/api/state` GET+PUT** — hydrate the signed-in user; patch profile/context/reset. `force-dynamic`. `[depends on: Server data layer]`
- [x] **Chat reads context from DB + persists turns** — `/api/chat` overrides context/topics/level from the DB when signed in (BUILD_SPEC §3/§5) and inserts the user turn + reply. `[depends on: Server data layer]`
- [x] **Client sync bridge** — `state-sync.ts` (`dbMode`, `fetchServerState`, `patchServerState`), `ServerSync` hydrates stores from DB, `useSyncStore.checked` gates onboarding redirects; `context-actions.ts` writes local + DB in one path. `[depends on: /api/state]`
- [x] **Settings "last synced" + one data model** — Settings shows last-synced/source count; onboarding + settings write the same profile fields; reset clears chat+context and re-arms onboarding. **Fallback path verified live.** `[depends on: Client sync bridge]`
- [x] **DB gate** — Supabase live 2026-07-15; both migrations applied, RLS enforced, `/api/state` → `persisted:true`. **Verified:** magic-link login; new user forced through onboarding from DB truth; onboarding wrote `level:'B1'`/`topics:['food']`; Google Doc (2,902 chars) → `user_context` → engine (Honza quizzed "airport" = the doc's line 1); 3 turns written to `messages`; **hard refresh re-rendered the thread from the DB**; sign-out cleared the session. **Final three closed 2026-07-15:** re-login persistence (signed out + **cleared `localStorage`** → all 3 messages still re-rendered from the DB; new turn persisted 3 → 5) · doc survives re-login (same 2,902 chars; a *fresh* turn quizzed "restaurant" = `Restaurace`, in the doc) · returning user skips onboarding (A → `/`, B → `/onboarding`, both from DB truth) · second user isolated (0 messages, 0 context, no bleed). Email cap unblocked via `scripts/dev-signin.mjs`. `[done]`

---

## BUILD_SPEC Phase 7 — Home screen (Honza initiates)

- [x] **`buildOpenerPrompt`** — engine helper producing an ambient unprompted opener aware of time-of-day + time since last contact. `[independent]`
- [x] **Home initiation** — on load, if the thread is empty, Home calls the engine and surfaces the opener (real Czech, "Honza wrote to you" card) instead of a blank screen; hero orb reads shared mood. Shared thread flows into Chat with no double-bootstrap. **Verified live at 375px.** `[depends on: BS Phase 2, Client sync bridge]`

---

## BUILD_SPEC Phase 9 — Landing page + polish pass

- [x] **`/welcome` landing page** — unauthenticated front door: hero orb, the three-step loop, and real topic/level chips rendered from `lib/constants` (the marketing surface can't drift from the product, and nothing on it is invented sample data per BUILD_SPEC §5). Honest about the one seam — says a message is *waiting when you open the app*, never claims a phone notification fires. Prerenders static (1.77 kB). `[depends on: BS Phase 1]`
- [x] **Front-door routing** — middleware sends signed-out `/` → `/welcome` (it used to dump strangers straight on a login form); deeper links still → `/signin?next=…`; signed-in users are bounced off `/welcome`. `AppShell` hides the tab bar there (a signed-out visitor's nav would only bounce back to sign-in). **Verified live** with throwaway Supabase values (env restored byte-identical after): `/`→307→`/welcome`, `/welcome`+`/signin`→200, `/chat`+`/settings`+`/onboarding`→307→`/signin?next=…`. `[depends on: BS Phase 1]`
- [x] **DESIGN.md polish pass — every screen** — walked welcome/signin/onboarding/home/chat/settings live at 390px + desktop. Fixed: `Card`'s legacy `shadow-black/40`; faux-bold headings (see Token audit, Phase 1); onboarding's `avatar` orb → `hero` (it was the only primary surface leading with a 64px character, against DESIGN.md rule 7) and its `tracking-tight` heading; **Settings had no Honza on it at all** → now leads with an avatar orb reading the shared mood, like the chat header. `[depends on: all prior phases]`
- [x] **Learner-facing copy** — onboarding's first line read *"The API key stays on the server (Vercel env)"* and Settings' read *"API keys live on the server (Vercel)"* — build notes leaked onto learner screens. Rewritten in Honza's voice; dropped "(no OAuth)" from the Google-Doc help while keeping the actionable Share → Anyone with the link → Viewer step. `[independent]`
- [x] **PWA install confirmed** — `manifest.json` serves valid (standalone, cream theme, `any` + `maskable` icons all present on disk); install UX shipped in Phase 4. `[depends on: next-pwa]`

---

## How to use in each session

1. Pick the **lowest phase** with an unchecked task.
2. Prefer **`[independent]`** tasks when starting cold.
3. After completing a task, update **`MEMORY.md`** (what works, what broke, decisions).
4. Do not reopen decisions in **`MEMORY.md` §3** unless the team explicitly flags a change.
