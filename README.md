# Hey Honza

**Honza** is a mobile-first Czech language learning PWA. Learners practice real Czech in short daily conversations with Honza — an AI persona who behaves like a friendly tutor and conversation partner.

---

## What it does

- Honza initiates conversations and prompts the user to reply in Czech
- Responses are evaluated for grammar and vocabulary, with gentle corrections and encouragement
- The experience adapts to the learner's goals, level, and topics of interest set during onboarding
- Learner context can be loaded from a Google Doc URL to personalise Honza's teaching
- Each learner has a real account, so history and context persist across devices and sessions

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + Share Tech Mono font |
| State | Zustand |
| AI | OpenRouter (via Next.js Route Handlers) |
| Auth + DB | Supabase (email+password, Postgres with row-level security) |
| Deployment | Vercel |
| PWA | next-pwa (installable, manifest, icons) |

## Project structure

```
src/
  app/
    welcome/              # Signed-out front door
    signin/               # Email + password, with email confirmation
    auth/                 # Callback + sign-out routes
    page.tsx              # Home — Honza's presence and entry to practice
    onboarding/           # First-run setup (level, topics, context)
    chat/                 # Main practice surface (typed)
    call/                 # Live voice call — you speak Czech, Honza speaks back
    settings/             # Preferences, learner context, reset
    api/
      chat/               # LLM proxy — all AI calls go through here
      tts/                # Voice proxy — returns audio bytes, key never client-side
      state/              # Per-user hydrate + persist (profile, messages, context)
      context/google-doc/ # Fetches published Google Doc content server-side
      health/             # Health check endpoint
  middleware.ts           # Session refresh + route guards (must live under src/)
  components/
    honza/                # HonzaOrb (dot-matrix character), StatusPill
    chat/                 # MessageList (groups call transcripts), MessageBubble, Composer, VoiceReplyButton
    layout/               # AppShell, BottomNav, ServerSync
    ui/                   # Button, Card, Input, Label, Textarea primitives
    pwa/                  # InstallPrompt
  stores/                 # useChatStore, useSettingsStore, useMoodStore, useSyncStore
  lib/                    # Utilities, validators, Supabase clients, server helpers
supabase/
  migrations/             # profiles, messages, user_context — RLS own-row throughout
scripts/
  dev-signin.mjs          # Local sign-in without an inbox (see below)
public/
  manifest.json           # PWA manifest
  icons/                  # icon-192.png, icon-512.png
```

## Design

The visual language is **dot-matrix / Nothing OS** — warm cream backgrounds, a monospace font (`Share Tech Mono`), and `//`-prefixed section labels. Honza's character is a pixel-face rendered as an SVG dot matrix that shifts expression and colour with each emotional state (`idle`, `thinking`, `speaking`, `oops`, `excited`).

Dark mode is out of scope for MVP. The app uses a single warm-light palette with per-state accent colours.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

See `.env.example` for the full list and notes.

```
OPENROUTER_API_KEY=            # required — the conversation engine
HONZA_DEFAULT_MODEL=           # optional, defaults to openai/gpt-4o-mini
NEXT_PUBLIC_SUPABASE_URL=      # required for accounts
NEXT_PUBLIC_SUPABASE_ANON_KEY= # required for accounts
```

**No provider key ever reaches the browser** — every model call goes through a Route Handler. The `NEXT_PUBLIC_SUPABASE_*` values are public by design: they identify the project, and row-level security is what protects the data.

Leave the Supabase variables blank to run the UI without auth: the middleware falls through and the app uses localStorage instead of the database.

### Signing in locally without an inbox

```bash
node scripts/dev-signin.mjs <email>
```

Prints an `/auth/callback` URL you can open in any browser. It mints the token through Supabase's admin API and **sends no email**, so the built-in mailer's ~2/hour cap doesn't apply. Needs `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` — that key bypasses row-level security, so it's local-dev only: never commit it, and never add it to Vercel.

## Deployment

Deploy to Vercel and set environment variables in the project dashboard. The `next-pwa` plugin generates the service worker automatically at build time.

## Scope

- Welcome, Sign-in, Onboarding, Home, Chat, **Call**, Settings
- Text conversation with Honza, persisted per learner
- Google Doc context ingestion (public URLs, no OAuth)
- PWA install support
- **Voice calls — built (2026-07-15).** `/call` is a live-call screen: speech-to-text on your spoken Czech (Web Speech API, `cs-CZ`) and ElevenLabs text-to-speech for Honza's replies, proxied server-side so the key never reaches the browser. The transcript persists into the same history as chat. *Mic + audible playback still need a human spot-check, and on ElevenLabs' free tier Honza speaks Czech with an English accent — see `BUILD_SPEC_STATUS.md` row 8.*

**Out of scope:** calendar/social features. Daily check-ins + PWA Web Push are in.
