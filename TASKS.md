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
- [x] **Magic-link sign-in screen + callback + signout** — `/signin`, `/auth/callback`, `/auth/signout`. `[done]`
- [ ] **End-to-end gate (needs Harish's Supabase keys)** — real email link → authed; refresh persists; sign-out; second email = separate user. `[blocked on: Supabase provisioning]`

---

## Phase 1 — Scaffold and design system

- [x] **Next.js 14 App Router + TypeScript project** — `src/app`, strict typing, ESLint. `[independent]`
- [x] **Tailwind + global dark tokens** — background, surface, accent, text, borders. `[independent]`
- [x] **Inter (`latin` + `latin-ext`) + root metadata/viewport** — PWA-ready HTML shell. `[depends on: Next.js 14 App Router + TypeScript project]`
- [x] **Zustand stores (chat, settings)** — persisted or hydrated patterns as designed. `[independent]`
- [x] **next-pwa** — `next.config.js`, manifest, generated worker in `public/`. `[independent]`
- [x] **Base UI primitives** — `Button`, `Card`, `Input`, `Label`, `Textarea`. `[depends on: Tailwind + global dark tokens]`
- [x] **Layout shell** — `AppShell`, `BottomNav`, mobile-first max width. `[depends on: Base UI primitives]`
- [ ] **Toggle component** — a11y, keyboard, 999px pill track per `DESIGN.md`. `[depends on: Base UI primitives]`
- [x] **HonzaOrb states** — idle / thinking / speaking / oops / excited motion + reduced-motion path; all five states render with per-state keyframes and a 200ms crossfade. `[depends on: Layout shell]`
- [ ] **Token audit** — align implementation with `DESIGN.md` (e.g. muted vs surface roles). `[depends on: Tailwind + global dark tokens]`

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
- [ ] **Live end-to-end chat verification** — real OpenRouter reply round-trip. `[blocked on: OPENROUTER_API_KEY]` (code paths, validation, rate limit, and not-configured 503 all verified without a key)

---

## Phase 4 — PWA polish and Vercel deploy

- [ ] **Icons + maskable assets** — match manifest; splash / apple meta if needed. `[independent]`
- [ ] **Install prompt UX** — timing, dismissal persistence, “already installed” detection. `[depends on: next-pwa]`
- [ ] **Service worker behavior** — `skipWaiting`, cache strategy sanity for App Router. `[depends on: next-pwa]`
- [ ] **Vercel project** — production branch, env vars (`OPENAI_API_KEY`, `HONZA_DEFAULT_MODEL`, etc.). `[independent]`
- [ ] **Production verification** — `next build`, smoke test chat + doc route on deployed URL. `[depends on: Vercel project]` + `[depends on: Client ↔ API wiring]`

---

## How to use in each session

1. Pick the **lowest phase** with an unchecked task.
2. Prefer **`[independent]`** tasks when starting cold.
3. After completing a task, update **`MEMORY.md`** (what works, what broke, decisions).
4. Do not reopen decisions in **`MEMORY.md` §3** unless the team explicitly flags a change.
