# Honza — build order (`TASKS.md`)

Use this file as the **session checklist**: work top to bottom within a phase unless dependencies say otherwise. Tags: **`[independent]`** = can start anytime; **`[depends on: …]`** = blocked until that task is done.

---

## Phase 0 — BUILD_SPEC repo inventory & reconciliation (read-only)

- [x] **Repo inventory + baseline build** — read CONTEXT/DESIGN/TASKS/MEMORY + all `src/` primitives; `npm install` + `lint` + `build` all green. Findings recorded in `MEMORY.md` (2026-07-14 entry). `[independent]`
- [x] **Primitive status stated** — auth (none), Honza state store (partial: component yes, shared store no), conversation engine (partial: OpenAI not OpenRouter, in-route not service), context ingestion (partial: fetch yes, per-user DB no). `[independent]`
- [x] **Design tokens confirmed vs DESIGN.md** — cream/Share Tech Mono/state colors all match; no dark remnants. `[independent]`
- [x] **BUILD_SPEC adoption decision** — Harish (2026-07-14): adopt BUILD_SPEC **phase-gated** (confirm each phase boundary); switch model gateway to **OpenRouter**. See MEMORY.md. `[done]`

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
- [ ] **HonzaOrb states** — idle / thinking / speaking motion + reduced-motion path. `[depends on: Layout shell]`
- [ ] **Token audit** — align implementation with `DESIGN.md` (e.g. muted vs surface roles). `[depends on: Tailwind + global dark tokens]`

---

## Phase 2 — Core screens (onboarding, home, chat, settings)

- [x] **Routes wired** — `/`, `/onboarding`, `/chat`, `/settings`. `[depends on: Layout shell]`
- [ ] **Onboarding** — steps, validation, completion flag, route to home. `[depends on: Routes wired]` + `[depends on: Zustand stores (chat, settings)]`
- [ ] **Home** — Honza status, entry into chat, orb integration. `[depends on: HonzaOrb states]` + `[depends on: Routes wired]`
- [ ] **Chat** — message list, composer, empty/loading/error states, Honza vs user styling. `[depends on: Routes wired]` + `[depends on: Zustand stores (chat, settings)]`
- [ ] **Settings** — doc URL field, toggles, reset/export if spec’d. `[depends on: Toggle component]` + `[depends on: Zustand stores (chat, settings)]`
- [ ] **Navigation polish** — back behavior, deep links, onboarding gate on first visit. `[depends on: Onboarding]`

---

## Phase 3 — AI integration via Route Handlers

- [x] **`/api/chat` Route Handler** — server-side OpenAI (or chosen provider) proxy. `[independent]`
- [x] **`/api/context/google-doc` + server helper** — public URL fetch, no OAuth. `[independent]`
- [x] **`/api/health`** — deploy/smoke checks. `[independent]`
- [ ] **Chat API hardening** — validation, error mapping, timeouts, optional streaming. `[depends on: /api/chat Route Handler]`
- [ ] **Honza persona + system prompt** — level-aware Czech tutoring behavior. `[independent]`
- [ ] **Client ↔ API wiring** — send history, apply assistant messages to store, optimistic UI. `[depends on: Chat API hardening]` + `[depends on: Chat]`
- [ ] **Context injection** — merge Google Doc excerpt into prompt when URL valid. `[depends on: /api/context/google-doc + server helper]` + `[depends on: Client ↔ API wiring]`
- [ ] **Rate limiting / abuse basics** — minimal protection if exposed publicly. `[depends on: Chat API hardening]`

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
