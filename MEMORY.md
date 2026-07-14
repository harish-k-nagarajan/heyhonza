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
