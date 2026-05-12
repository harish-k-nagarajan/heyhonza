# Hey Honza

**Honza** is a mobile-first Czech language learning PWA. Learners practice real Czech in short daily conversations with Honza — an AI persona who behaves like a friendly tutor and conversation partner.

---

## What it does

- Honza initiates conversations and prompts the user to reply in Czech
- Responses are evaluated for grammar and vocabulary, with gentle corrections and encouragement
- The experience adapts to the learner's goals, level, and topics of interest set during onboarding
- Learner context can be loaded from a Google Doc URL to personalise Honza's teaching

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + Share Tech Mono font |
| State | Zustand |
| AI | OpenAI API (via Next.js Route Handlers) |
| Deployment | Vercel |
| PWA | next-pwa (installable, manifest, icons) |

## Project structure

```
src/
  app/
    page.tsx              # Home — Honza's presence and entry to practice
    onboarding/           # First-run setup (name, goals, level, topics)
    chat/                 # Main practice surface
    settings/             # Preferences and learner context
    api/
      chat/               # LLM proxy — all AI calls go through here
      context/google-doc/ # Fetches published Google Doc content server-side
      health/             # Health check endpoint
  components/
    honza/                # HonzaOrb (dot-matrix character), StatusPill
    chat/                 # MessageList, MessageBubble, Composer, VoiceReplyButton
    layout/               # AppShell, BottomNav
    ui/                   # Button, Card, Input, Label, Textarea primitives
    pwa/                  # InstallPrompt
  stores/                 # useChatStore, useSettingsStore
  lib/                    # Shared utilities, validators, server helpers
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
cp .env.example .env.local   # add your OPENAI_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

See `.env.example` for the full list. The only required variable for the MVP is:

```
OPENAI_API_KEY=sk-...
```

All keys are server-side only and never exposed to the client.

## Deployment

Deploy to Vercel and set environment variables in the project dashboard. The `next-pwa` plugin generates the service worker automatically at build time.

## MVP scope

- Onboarding, Home, Chat, Settings
- Text-based conversation with Honza
- Google Doc context ingestion (public URLs, no OAuth)
- PWA install support

**Out of scope for MVP:** voice calls, scheduling, social features.
