# Honza — product context

## What Honza is

Honza is a **Czech language learning PWA**: a mobile-first, installable web app where learners practice real Czech in conversation with **Honza**, an AI persona who behaves like a friendly tutor and conversation partner.

## Who it is for

People who want to **learn or maintain Czech** through short, daily interactions—especially on the phone—without the feel of a generic flashcard game. The experience should feel human, warm, and a bit funny, while staying focused on useful language practice.

## Core loop

1. **Honza initiates contact** — he writes first, unprompted, in a message-style thread. A **real spoken call** is in scope when a TTS key is configured.
2. The **user replies in Czech** — typed in chat, or spoken on a call.
3. Honza responds with corrections, encouragement, and the next conversational beat so the loop continues.

The product goal is habitual practice driven by Honza’s presence, not passive content consumption.

## Key technical and product decisions (already made)

| Decision | Rationale |
|----------|-----------|
| **Secrets live only in Vercel environment variables** | No secrets in the client or repo; `.env.example` documents names only. |
| **All model calls go through Next.js Route Handlers** | Server-side proxy keeps keys safe and gives one place for logging, validation, and model policy. The same rule applies to TTS. |
| **OpenRouter is the model gateway** (2026-07-14) | One key, swappable models behind a single config value. Supersedes the original OpenAI-direct decision. |
| **Google Doc ingestion uses public URLs; no OAuth** | Simpler: fetch published/export-style content server-side when given a URL; no Google account linking. |
| **Real accounts, on Supabase** (2026-07-15) | Email+password with email confirmation, Postgres with own-row RLS. Honza's value is continuity — history and context that persist and follow the learner — which anonymous browser storage can't give. Rejected Clerk (auth-only; the DB stays Supabase either way) and Google SSO (no new vendors before the core product is tested). |
| **Fern Mist O4** (2026-08) | Product chrome. `DESIGN.md` indexes it. Cream canvas, Doto for short labels, Inter for body text, square dot-matrix Honza. Dark tokens and the Hmat Metal inset well are legacy. |
| **Mobile first, installable PWA** | Primary use case is on-the-go practice; `next-pwa`, manifest, and install affordances support that. |
| **Spoken calls are in v1** (2026-07-14) | Voice moved from out of scope into the product. `/call` shipped with typed chat. |

## Scope

- **Welcome** — the signed-out front door; explains Honza in one screen and leads into sign-up.
- **Sign-in** — email+password with email confirmation.
- **Onboarding** — first-run setup (level, topics, Google Doc context).
- **Home** — hub for “what Honza is doing now”; he opens the conversation here, unprompted.
- **Chat** — main practice surface (messages, composer, Honza state).
- **Settings** — preferences, context URL for Google Doc, model options, and a reset that clears history and re-runs onboarding.
- **Call** — a real spoken conversation. You speak Czech and Honza answers out loud. The transcript lands in the same history as chat.

## Out of scope

- **Calendar / social** (friends, leaderboards, sharing, a real calendar).
- **Daily check-ins + Web Push are in scope** — Honza can write first on a schedule and notify an installed PWA. iOS only delivers Web Push after Add to Home Screen.

**Real voice calls are in the product.** `/call` is a live-call screen where you speak Czech and Honza answers out loud, with the transcript landing in the same history as chat. Hearing the reply still needs a person with a speaker. A headless check cannot confirm that.

## Repository layout (high level)

- **`src/app/`** — App Router pages (`welcome`, `signin`, `page`, `onboarding`, `chat`, `settings`), auth routes under `auth/`, and Route Handlers under `api/`.
- **`src/components/`** — Layout (`AppShell`, `BottomNav`, `ServerSync`), Honza visuals (`HonzaOrb`, `StatusPill`), UI primitives, chat blocks, PWA install UI.
- **`src/stores/`** — Zustand stores for chat, settings, Honza's mood, and server-sync status.
- **`src/lib/`** — Shared utilities, validators, Supabase clients, server helpers (conversation engine, Google Doc fetch, per-user data).
- **`supabase/migrations/`** — Schema: `profiles`, `messages`, `user_context`; own-row RLS throughout.
- **`public/`** — Manifest, icons, generated service worker assets from `next-pwa`.

This document is the single source of truth for **what Honza is and why**. Implementation details belong in the code and in `DESIGN.md`.
