# Honza — product context

## What Honza is

Honza is a **Czech language learning PWA**: a mobile-first, installable web app where learners practice real Czech in conversation with **Honza**, an AI persona who behaves like a friendly tutor and conversation partner.

## Who it is for

People who want to **learn or maintain Czech** through short, daily interactions—especially on the phone—without the feel of a generic flashcard game. The experience should feel human, warm, and a bit funny, while staying focused on useful language practice.

## Core loop

1. **Honza initiates contact** — via a message-style thread or a **simulated call** experience (UI/flow only for MVP where noted; see scope).
2. The **user replies in Czech** (typed text for MVP; richer modalities later).
3. Honza responds with corrections, encouragement, and the next conversational beat so the loop continues.

The product goal is habitual practice driven by Honza’s presence, not passive content consumption.

## Key technical and product decisions (already made)

| Decision | Rationale |
|----------|-----------|
| **API keys live only in Vercel environment variables** | No secrets in the client or repo; `.env.example` documents names only. |
| **All LLM calls go through Next.js Route Handlers** | Server-side proxy keeps keys safe and gives one place for logging, validation, and model policy. |
| **Google Doc ingestion uses public URLs; no OAuth** | Simpler MVP: fetch published/export-style content server-side when given a URL; no Google account linking. |
| **Dark mode only for MVP** | Faster visual consistency; `color-scheme: dark` and a single palette reduce design and QA surface. |
| **Mobile first, installable PWA** | Primary use case is on-the-go practice; `next-pwa`, manifest, and install affordances support that. |

## MVP scope

- **Onboarding** — first-run setup (name, goals, level, consent copy as needed).
- **Home** — hub for “what Honza is doing now” and entry into practice.
- **Chat** — main practice surface (messages, composer, Honza state).
- **Settings** — preferences, context URL for Google Doc, model-related options as exposed by the API layer.

## Out of scope for MVP

- **Real voice calls** (WebRTC/telephony) and continuous speech sessions.
- **Scheduling** (calendar, reminders beyond what the OS/browser already provides).
- **Social features** (friends, leaderboards, sharing).

Simulated or lightweight “call” **UI** may appear on the roadmap as a Phase 2+ polish item; true voice is explicitly post-MVP.

## Repository layout (high level)

- **`src/app/`** — App Router pages (`page`, `onboarding`, `chat`, `settings`) and Route Handlers under `api/`.
- **`src/components/`** — Layout (`AppShell`, `BottomNav`), Honza visuals (`HonzaOrb`, `StatusPill`), UI primitives, chat blocks, PWA install UI.
- **`src/stores/`** — Zustand stores for chat and settings.
- **`src/lib/`** — Shared utilities, validators, server helpers (e.g. Google Doc fetch).
- **`public/`** — Manifest, icons, generated service worker assets from `next-pwa`.

This document is the single source of truth for **what Honza is and why**; implementation details belong in code and in `DESIGN.md` / `TASKS.md`.
