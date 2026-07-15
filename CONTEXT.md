# Honza — product context

## What Honza is

Honza is a **Czech language learning PWA**: a mobile-first, installable web app where learners practice real Czech in conversation with **Honza**, an AI persona who behaves like a friendly tutor and conversation partner.

## Who it is for

People who want to **learn or maintain Czech** through short, daily interactions—especially on the phone—without the feel of a generic flashcard game. The experience should feel human, warm, and a bit funny, while staying focused on useful language practice.

## Core loop

1. **Honza initiates contact** — he writes first, unprompted, in a message-style thread. A **real spoken call** is v1 scope (BUILD_SPEC Phase 8), gated on a TTS key.
2. The **user replies in Czech** — typed today; spoken once Phase 8 lands.
3. Honza responds with corrections, encouragement, and the next conversational beat so the loop continues.

The product goal is habitual practice driven by Honza’s presence, not passive content consumption.

## Key technical and product decisions (already made)

| Decision | Rationale |
|----------|-----------|
| **Secrets live only in Vercel environment variables** | No secrets in the client or repo; `.env.example` documents names only. |
| **All model calls go through Next.js Route Handlers** | Server-side proxy keeps keys safe and gives one place for logging, validation, and model policy. Applies to TTS too, when Phase 8 lands. |
| **OpenRouter is the model gateway** (2026-07-14) | One key, swappable models behind a single config value. Supersedes the original OpenAI-direct decision. |
| **Google Doc ingestion uses public URLs; no OAuth** | Simpler: fetch published/export-style content server-side when given a URL; no Google account linking. |
| **Real accounts, on Supabase** (2026-07-15) | Email+password with email confirmation, Postgres with own-row RLS. Honza's value is continuity — history and context that persist and follow the learner — which anonymous browser storage can't give. Rejected Clerk (auth-only; the DB stays Supabase either way) and Google SSO (no new vendors before the core product is tested). |
| **The cream / dot-matrix design system** (2026-05-12) | See `DESIGN.md`. **Supersedes the original "dark mode only" decision** — that call is dead; dark tokens or Inter in product chrome are legacy to migrate, not extend. |
| **Mobile first, installable PWA** | Primary use case is on-the-go practice; `next-pwa`, manifest, and install affordances support that. |
| **`BUILD_SPEC.md` adopted, phase-gated** (2026-07-14) | Build toward its 9 phases, pausing at each boundary for Harish's OK. This is what moved real voice from out-of-scope into v1. Live status: `BUILD_SPEC_STATUS.md`. |

## Scope

- **Welcome** — the signed-out front door; explains Honza in one screen and leads into sign-up.
- **Sign-in** — email+password with email confirmation.
- **Onboarding** — first-run setup (level, topics, Google Doc context).
- **Home** — hub for “what Honza is doing now”; he opens the conversation here, unprompted.
- **Chat** — main practice surface (messages, composer, Honza state).
- **Settings** — preferences, context URL for Google Doc, model options, and a reset that clears history and re-runs onboarding.
- **Call** — a real spoken conversation. **Not built yet:** BUILD_SPEC Phase 8, gated on a TTS key *and* Harish's explicit go-ahead.

## Out of scope

- **Scheduling** (calendar, reminders beyond what the OS/browser already provides).
- **Social features** (friends, leaderboards, sharing).

**Real voice calls used to be listed here and no longer are** — adopting `BUILD_SPEC.md` on 2026-07-14 moved them into v1 as Phase 8. They stay double-gated (TTS key + Harish's OK), so don't start that work on the strength of this line alone.

## Repository layout (high level)

- **`src/app/`** — App Router pages (`welcome`, `signin`, `page`, `onboarding`, `chat`, `settings`), auth routes under `auth/`, and Route Handlers under `api/`.
- **`src/components/`** — Layout (`AppShell`, `BottomNav`, `ServerSync`), Honza visuals (`HonzaOrb`, `StatusPill`), UI primitives, chat blocks, PWA install UI.
- **`src/stores/`** — Zustand stores for chat, settings, Honza's mood, and server-sync status.
- **`src/lib/`** — Shared utilities, validators, Supabase clients, server helpers (conversation engine, Google Doc fetch, per-user data).
- **`supabase/migrations/`** — Schema: `profiles`, `messages`, `user_context`; own-row RLS throughout.
- **`public/`** — Manifest, icons, generated service worker assets from `next-pwa`.

This document is the single source of truth for **what Honza is and why**; implementation details belong in code and in `DESIGN.md` / `TASKS.md`. For where the build actually stands, read `BUILD_SPEC_STATUS.md` — not this file.
