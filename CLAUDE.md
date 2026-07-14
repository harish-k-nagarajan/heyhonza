# CLAUDE.md

Guidance for Claude Code working in this repository. Honza already has a documentation system — this file tells you how to use it. Do not duplicate content that lives in the four docs below; link to it and keep each doc authoritative for its own domain.

## Doc Map (read in this order when starting cold)

| File | Owns | Rule |
|------|------|------|
| `CONTEXT.md` | What Honza is, who it's for, MVP scope, decided architecture | Single source of truth for product intent. Don't contradict it. |
| `DESIGN.md` | The visual system (cream / dot-matrix / Share Tech Mono) | Single source of truth for all UI decisions. |
| `TASKS.md` | Build order with dependency tags | Pick the lowest phase with an unchecked task; prefer `[independent]` when starting cold. Check items off as you complete them. |
| `MEMORY.md` | What works, what broke, decisions not to revisit | **Update after every meaningful change or debugging session.** |
| `README.md` | Public-facing summary | Keep in sync when scope or stack changes. |
| `BUILD_SPEC.md` | Full v1 build spec (phased plan, primitives, integration doctrine) for a larger scope than current MVP (magic-link auth, OpenRouter, voice calls, etc.) | Reference only — **not yet reconciled** with the Hard Rules below. Do not build toward it without Harish's explicit OK; where it conflicts with `CONTEXT.md` or the Hard Rules, those win until this doc is formally adopted. |

## Project Overview

**Honza** is a mobile-first Czech language learning PWA. Learners practice real Czech in short daily conversations with Honza, an AI persona who acts as a friendly tutor. Core loop: Honza initiates → user replies in Czech (typed, MVP) → Honza corrects, encourages, continues.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js **14** App Router + TypeScript |
| Styling | Tailwind CSS 3.4 |
| State | Zustand (`useChatStore`, `useSettingsStore` in `src/stores/`) |
| AI | OpenAI API — **only** via Next.js Route Handlers (`src/app/api/`) |
| PWA | next-pwa (disabled in dev by plugin behavior; manifest + icons in `public/`) |
| Deployment | Vercel |

## Commands

```bash
npm run dev      # next dev (PWA disabled in dev)
npm run build    # next build (generates service worker assets)
npm run start    # next start
npm run lint     # next lint
```

No test framework is configured. Verification is lint + build + manual check on a mobile viewport (~430px "phone stage").

## Hard Rules (decided — do not revisit without Harish's explicit OK)

1. **API keys live only in Vercel env vars** (and local `.env` for dev). Never in the client, never in the repo. `.env.example` documents names only: `OPENAI_API_KEY` (required), `HONZA_DEFAULT_MODEL` (optional, default `gpt-4o-mini`).
2. **All LLM calls go through Route Handlers** (`/api/chat`). No OpenAI calls from the browser, ever.
3. **Google Doc ingestion uses public URLs, no OAuth** (`/api/context/google-doc` fetches server-side).
4. **Mobile-first installable PWA** is the product; design desktop as a centered ~430px phone stage.
5. **The design system is the cream / dot-matrix system in `DESIGN.md`** (Share Tech Mono, `#F5F2EE` canvas, state-tinted backgrounds, HonzaOrb square dot-matrix face). This **superseded** the original "dark mode only" decision on 2026-05-12. If you find dark tokens or Inter font in product chrome, they are legacy — migrate them per DESIGN.md, don't extend them.
6. **Out of scope for MVP:** real voice calls, scheduling, social features. Don't build toward them.
7. **The character is the app.** Honza is never a small decorative icon on primary surfaces; every screen leads with the character (see DESIGN.md).

## Architecture Notes

- **Routes:** `/` (home), `/onboarding`, `/chat`, `/settings`; API: `/api/chat`, `/api/context/google-doc`, `/api/health`.
- **Components:** `src/components/` — `layout/` (AppShell, BottomNav), `honza/` (HonzaOrb, StatusPill), `chat/` (MessageList, MessageBubble, Composer, VoiceReplyButton), `ui/` primitives, `pwa/` (InstallPrompt).
- **Honza's emotional states** (`idle` / `thinking` / `speaking` / `oops` / `excited`) drive app-wide background tint + accent. Palette lives in `HONZA_STATE_COLORS` in `HonzaOrb.tsx`; specs in DESIGN.md. Keep those two in sync.
- All motion respects `prefers-reduced-motion` (see DESIGN.md motion table).

## Definition of Done

Before calling any task finished:

1. `npm run lint` and `npm run build` both pass.
2. Checked on a mobile-width viewport; layout holds inside the ~430px phone stage.
3. New UI matches DESIGN.md (Share Tech Mono, `//` section labels with correct letter-spacing, state colors, 16px card radius) — not the legacy dark tokens.
4. No secrets in client code; any new AI behavior goes through a Route Handler.
5. The completed task is checked off in `TASKS.md` and `MEMORY.md` is updated (what works / what broke / decisions).

## Current State (as of MEMORY.md 2026-05-12)

Scaffold, routes, stores, UI primitives, layout shell, and the three API handlers are built and confirmed running on localhost. Not yet done: HonzaOrb state motion, onboarding flow, chat wiring to the API, persona system prompt, PWA polish, Vercel deploy. See `TASKS.md` for exact status — trust the checkboxes there over this paragraph.
