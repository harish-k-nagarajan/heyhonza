# CLAUDE.md

Guidance for Claude Code working in this repository. Honza already has a documentation system — this file tells you how to use it. Do not duplicate content that lives in the docs below; link to it and keep each doc authoritative for its own domain.

## Doc Map (read in this order when starting cold)

| File | Owns | Rule |
|------|------|------|
| `CONTEXT.md` | What Honza is, who it's for, MVP scope, decided architecture | Single source of truth for product intent. Don't contradict it. |
| `DESIGN.md` | The visual system (cream / dot-matrix / Share Tech Mono) | Single source of truth for all UI decisions. |
| `TASKS.md` | Build order with dependency tags | Pick the lowest phase with an unchecked task; prefer `[independent]` when starting cold. Check items off as you complete them. |
| `BUILD_SPEC_STATUS.md` | Live per-phase status of `BUILD_SPEC.md` + the evidence behind each ✅ | **The fastest read for "where is this project actually at."** Trust this table and `TASKS.md`'s checkboxes over prose anywhere else, including this file. |
| `MEMORY.md` | What works, what broke, decisions not to revisit | **Update after every meaningful change or debugging session.** |
| `README.md` | Public-facing summary | Keep in sync when scope or stack changes. |
| `BUILD_SPEC.md` | Full v1 build spec (phased plan, primitives, integration doctrine) | **Adopted phase-gated** (Harish, 2026-07-14) — build toward it, but **pause at each phase boundary for his OK**, since several phases need accounts or secrets only he can provision. Where it conflicts with `DESIGN.md`, DESIGN.md wins (e.g. BUILD_SPEC's `happy` state is really `excited`). Live status lives in `BUILD_SPEC_STATUS.md`, not here. |

## Project Overview

**Honza** is a mobile-first Czech language learning PWA. Learners practice real Czech in short daily conversations with Honza, an AI persona who acts as a friendly tutor. Core loop: Honza initiates → user replies in Czech (typed, MVP) → Honza corrects, encourages, continues.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js **14** App Router + TypeScript |
| Styling | Tailwind CSS 3.4 |
| State | Zustand (`useChatStore`, `useSettingsStore`, `useMoodStore`, `useSyncStore` in `src/stores/`) |
| AI | **OpenRouter** (default `openai/gpt-4o-mini`) — **only** via Next.js Route Handlers (`src/app/api/`). Engine: `src/lib/server/conversation-engine.ts`. |
| Auth + DB | **Supabase** — email+password with email confirmation, Postgres with own-row RLS. Clients in `src/lib/supabase/`; migrations in `supabase/migrations/`. |
| PWA | next-pwa (disabled in dev by plugin behavior; manifest + icons in `public/`) |
| Deployment | Vercel |

## Commands

```bash
npm run dev      # next dev (PWA disabled in dev)
npm run build    # next build (generates service worker assets)
npm run start    # next start
npm run lint     # next lint

# Local sign-in without an inbox. Sends no email, so the built-in mailer's
# ~2/hour cap never applies. Prints an /auth/callback URL; open it in the
# browser you want the session in. Needs SUPABASE_SERVICE_ROLE_KEY.
node scripts/dev-signin.mjs <email> [next]
```

**Never run `npm run build` while `next dev` is up** — it overwrites `.next` and strips the running dev server's CSS. The result looks like a catastrophic style regression but is an artifact; restart dev.

No test framework is configured. Verification is lint + build + manual check on a mobile viewport (~430px "phone stage").

## Hard Rules (decided — do not revisit without Harish's explicit OK)

1. **Secrets live only in Vercel env vars** (and local `.env.local` for dev). Never in the client, never in the repo. `.env.example` documents names only. Current: `OPENROUTER_API_KEY` (required), `HONZA_DEFAULT_MODEL` (optional, default `openai/gpt-4o-mini`), `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public-safe — RLS protects the data), and `SUPABASE_SERVICE_ROLE_KEY` (**local dev only** — it bypasses RLS; used solely by `scripts/dev-signin.mjs`, never imported by `src/`, never added to Vercel). *(Supersedes the original `OPENAI_API_KEY` naming — gateway moved to OpenRouter on 2026-07-14 with Harish's OK.)*
2. **All model calls go through Route Handlers** (`/api/chat`; TTS likewise when Phase 8 lands). No LLM or TTS provider is ever called from the browser, and no provider key is ever exposed to it.
3. **Google Doc ingestion uses public URLs, no OAuth** (`/api/context/google-doc` fetches server-side).
4. **Mobile-first installable PWA** is the product; design desktop as a centered ~430px phone stage.
5. **The design system is the cream / dot-matrix system in `DESIGN.md`** (Share Tech Mono, `#F5F2EE` canvas, state-tinted backgrounds, HonzaOrb square dot-matrix face). This **superseded** the original "dark mode only" decision on 2026-05-12. If you find dark tokens or Inter font in product chrome, they are legacy — migrate them per DESIGN.md, don't extend them.
6. **Still out of scope:** scheduling and social features. Don't build toward them. **Voice is no longer out of scope** — it's BUILD_SPEC Phase 8, adopted 2026-07-14, but **double-gated: needs a TTS key *and* Harish's explicit go-ahead.** Neither exists as of 2026-07-15, so don't start it. (`CONTEXT.md` was reconciled to match on 2026-07-15.)
7. **The character is the app.** Honza is never a small decorative icon on primary surfaces; every screen leads with the character (see DESIGN.md).

## Architecture Notes

- **Routes:** `/welcome` (signed-out front door), `/signin`, `/` (home), `/onboarding`, `/chat`, `/settings`; auth: `/auth/callback`, `/auth/signout`; API: `/api/chat`, `/api/state`, `/api/context/google-doc`, `/api/health`.
- **Middleware:** `src/middleware.ts` — **must live under `src/`** (a root `middleware.ts` is not detected when the app is under `src/app`; a correct build lists `ƒ Middleware`). Refreshes the session and guards routes; signed-out `/` → `/welcome`.
- **Components:** `src/components/` — `layout/` (AppShell, BottomNav, ServerSync, MoodCycler), `honza/` (HonzaOrb, StatusPill, theme), `chat/` (MessageList, MessageBubble, Composer, VoiceReplyButton), `ui/` primitives, `pwa/` (InstallPrompt).
- **Honza's emotional states** (`idle` / `thinking` / `speaking` / `oops` / `excited`) live in the shared `useMoodStore` and drive app-wide background tint + accent via AppShell. Palette lives in `HONZA_STATE_COLORS` in `HonzaOrb.tsx`; specs in DESIGN.md. Keep those two in sync.
- **Two-mode persistence, one code path.** `/api/state` answers `persisted:true` only when Supabase is configured **and** a user is signed in; otherwise DB writes no-op and the localStorage-backed Zustand stores are authoritative. **When verifying DB persistence, clear `localStorage` first** — otherwise the fallback is a live alternative explanation for anything that renders.
- All motion respects `prefers-reduced-motion` (see DESIGN.md motion table).

## Definition of Done

Before calling any task finished:

1. `npm run lint` and `npm run build` both pass.
2. Checked on a mobile-width viewport; layout holds inside the ~430px phone stage.
3. New UI matches DESIGN.md (Share Tech Mono, `//` section labels with correct letter-spacing, state colors, 16px card radius) — not the legacy dark tokens.
4. No secrets in client code; any new AI behavior goes through a Route Handler.
5. **Gates are verified in the running app, not reasoned about.** "Should work" isn't done. If a gate can't be walked, say so and leave it 🟡 with honest gap text.
6. The completed task is checked off in `TASKS.md`, `BUILD_SPEC_STATUS.md` reflects any phase change, and `MEMORY.md` is updated (what works / what broke / decisions).

## Current State (as of MEMORY.md 2026-07-15)

The app runs on **live Supabase** end-to-end: auth (email+password + confirmation), per-user
profiles, chat history, and Google Doc context all persist and survive re-login, with RLS
isolating users. The conversation engine runs on **OpenRouter**. BUILD_SPEC rows 1–7 and 9
are ✅. **Not yet done:** Phase 8 (voice — needs a TTS key + Harish's OK), the `Toggle`
primitive (deliberately deferred — no screen has one), custom SMTP (pre-launch, for real
learners), and the Vercel deploy. See `BUILD_SPEC_STATUS.md` / `TASKS.md` — trust the
checkboxes there over this paragraph.

To sign in locally without an inbox: `node scripts/dev-signin.mjs <email>` (sends no email).
