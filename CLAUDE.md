# CLAUDE.md

Guidance for Claude Code working in this repository. Honza already has a documentation system — this file tells you how to use it. Do not duplicate content that lives in the docs below; link to it and keep each doc authoritative for its own domain.

## Doc Map (read in this order when starting cold)

| File | Owns | Rule |
|------|------|------|
| `CONTEXT.md` | What Honza is, who it's for, MVP scope, decided architecture | Single source of truth for product intent. Don't contradict it. |
| `DESIGN.md` | Index of identity, type roles, Classic archive | **Pixels: `honza.pen` (Fern Mist O4).** If DESIGN.md and the pen disagree, the pen wins. |
| `TASKS.md` | Build order with dependency tags | Pick the lowest phase with an unchecked task; prefer `[independent]` when starting cold. Check items off as you complete them. |
| `BUILD_SPEC_STATUS.md` | Live per-phase status of `BUILD_SPEC.md` + the evidence behind each ✅ | **The fastest read for "where is this project actually at."** Trust this table and `TASKS.md`'s checkboxes over prose anywhere else, including this file. |
| `MEMORY.md` | What works, what broke, decisions not to revisit | **Update after every meaningful change or debugging session.** |
| `README.md` | Public-facing summary | Keep in sync when scope or stack changes. |
| `BUILD_SPEC.md` | Full v1 build spec (phased plan, primitives, integration doctrine) | **Adopted phase-gated** (Harish, 2026-07-14) — build toward it, but **pause at each phase boundary for his OK**, since several phases need accounts or secrets only he can provision. Visuals: `honza.pen` over DESIGN.md over BUILD_SPEC (e.g. BUILD_SPEC's `happy` is really `excited`). Live status lives in `BUILD_SPEC_STATUS.md`, not here. |

## Project Overview

**Honza** is a mobile-first Czech language learning PWA. Learners practice real Czech in short daily conversations with Honza, an AI persona who acts as a friendly tutor. Core loop: Honza initiates → user replies in Czech (**typed in `/chat`, or spoken in `/call` where Honza speaks back**) → Honza corrects, encourages, continues.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js **14** App Router + TypeScript |
| Styling | Tailwind CSS 3.4 |
| State | Zustand (`useChatStore`, `useSettingsStore`, `useMoodStore`, `useSyncStore` in `src/stores/`) |
| AI | **OpenRouter** (default `openai/gpt-4o-mini`) — **only** via Next.js Route Handlers (`src/app/api/`). Engine: `src/lib/server/conversation-engine.ts`. |
| Voice | **STT:** Web Speech API in-browser (`cs-CZ`, `useSpeechRecognition`). **TTS:** ElevenLabs, server-side only via `/api/tts`; provider-swap notes in `src/lib/server/tts.ts`. |
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

1. **Secrets live only in Vercel env vars** (and local `.env.local` for dev). Never in the client, never in the repo. `.env.example` documents names only. Current: `OPENROUTER_API_KEY` (required unless the signed-in user pastes a BYOK key), `HONZA_DEFAULT_MODEL` (optional, default `openai/gpt-4o-mini`), `ELEVENLABS_API_KEY` (optional if the user pastes a BYOK voice key — **server-only**, read only by `src/lib/server/tts.ts`) + `ELEVENLABS_VOICE_ID` (optional), `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public-safe — RLS protects the data), `SUPABASE_SERVICE_ROLE_KEY` (server-only: `scripts/dev-signin.mjs` **and** `/api/cron/check-ins`; never `NEXT_PUBLIC_`), plus `SECRETS_ENCRYPTION_KEY`, VAPID keys, and `CRON_SECRET` for check-ins. Per-user provider keys are stored encrypted in Postgres and never returned to the browser.
2. **All model calls go through Route Handlers** — `/api/chat` for the LLM, `/api/tts` for voice (Phase 8, shipped 2026-07-15). No LLM or TTS provider is ever called from the browser, and no provider key is ever exposed to it. Verified against the production bundle for both keys.
3. **Google Doc ingestion uses public URLs, no OAuth** (`/api/context/google-doc` fetches server-side).
4. **Mobile-first installable PWA** is the product; design desktop as a centered ~430px phone stage.
5. **The design system is Fern Mist O4 in `honza.pen`** (cream canvas, Doto + Space Grotesk, square dot-matrix Honza). `DESIGN.md` indexes that; it is not an independent pixel spec. This **superseded** the original "dark mode only" decision on 2026-05-12 and the Hmat Metal inset-well mock. If you find dark tokens, Inter, or Metal inset-well chrome on product surfaces, migrate toward the pen — don't extend them.
6. **Still out of scope:** calendar and social features. **Daily check-ins + Web Push are in.** **Voice is IN and now BUILT** — BUILD_SPEC Phase 8 shipped 2026-07-15 once Harish supplied an ElevenLabs key *and* the go-ahead (the old double gate is cleared; this rule previously said "don't start it"). `/call` + `/api/tts` + `kind:'call'` transcripts exist. Row 8 is still **🟡** only because mic/audio can't be verified headlessly — see `DEPLOY.md` §5. **TTS calls go through `/api/tts` only**; `ELEVENLABS_API_KEY` is server-only.
7. **The character is the app.** Honza is never a small decorative icon on primary surfaces; every screen leads with the character (see DESIGN.md).

## Architecture Notes

- **Routes:** `/welcome` (signed-out front door), `/signin`, `/` (home), `/onboarding`, `/chat`, `/call`, `/settings`, `/settings/account`; auth: `/auth/callback`, `/auth/signout`; API: `/api/chat`, `/api/tts`, `/api/state`, `/api/context/google-doc`, `/api/health`, `/api/models`, `/api/providers/*`, `/api/cron/check-ins`, `/api/push/subscribe`.
- **Middleware:** `src/middleware.ts` — **must live under `src/`** (a root `middleware.ts` is not detected when the app is under `src/app`; a correct build lists `ƒ Middleware`). Refreshes the session and guards routes; signed-out `/` → `/welcome`.
- **Components:** `src/components/` — `layout/` (AppShell, BottomNav, ServerSync, MoodCycler), `honza/` (HonzaOrb, StatusPill, theme), `chat/` (MessageList — which groups `kind:'call'` turns into a labeled transcript, MessageBubble, Composer, VoiceReplyButton), `ui/` primitives, `pwa/` (InstallPrompt). The call screen is `src/app/call/CallClient.tsx`.
- **Honza's emotional states** (`idle` / `thinking` / `speaking` / `oops` / `excited`) live in the shared `useMoodStore` and drive app-wide background tint + accent via AppShell. Palette lives in `HONZA_STATE_COLORS` in `HonzaOrb.tsx`; specs in DESIGN.md. Keep those two in sync.
- **Two-mode persistence, one code path.** `/api/state` answers `persisted:true` only when Supabase is configured **and** a user is signed in; otherwise DB writes no-op and the localStorage-backed Zustand stores are authoritative. **When verifying DB persistence, clear `localStorage` first** — otherwise the fallback is a live alternative explanation for anything that renders.
- All motion respects `prefers-reduced-motion` (see DESIGN.md motion table).

## Definition of Done

Before calling any task finished:

1. `npm run lint` and `npm run build` both pass.
2. Checked on a mobile-width viewport; layout holds inside the ~430px phone stage.
3. New UI matches `honza.pen` / DESIGN.md (Doto + Space Grotesk, O4 recess/dock/fields, state colors) — not legacy dark tokens, Share Tech Mono product chrome, or the Metal inset well.
4. No secrets in client code; any new AI behavior goes through a Route Handler.
5. **Gates are verified in the running app, not reasoned about.** "Should work" isn't done. If a gate can't be walked, say so and leave it 🟡 with honest gap text.
6. The completed task is checked off in `TASKS.md`, `BUILD_SPEC_STATUS.md` reflects any phase change, and `MEMORY.md` is updated (what works / what broke / decisions).

## Current State (as of MEMORY.md 2026-07-15)

The app runs on **live Supabase** end-to-end: auth (email+password + confirmation), per-user
profiles, chat history, and Google Doc context all persist and survive re-login, with RLS
isolating users. The conversation engine runs on **OpenRouter**. BUILD_SPEC rows 1–7 and 9
are ✅. **Phase 8 (voice) is BUILT** (2026-07-15): `/call`, server-side TTS via `/api/tts`,
and `kind:'call'` transcripts in the shared history. Row 8 sits at **🟡** because mic +
audible playback can't be verified headlessly — Harish's 2-minute checklist is `DEPLOY.md`
§5. **Known voice limitation:** ElevenLabs' free tier can't use library voices via the API,
so Honza currently speaks Czech with an **English accent** via a premade fallback; a paid
plan fixes it with no code change. **Not yet done:** the `Toggle` primitive (deliberately
deferred — no screen has one), custom SMTP (pre-launch, for real learners), and the Vercel
deploy. See `BUILD_SPEC_STATUS.md` / `TASKS.md` — trust the checkboxes there over this
paragraph.

To sign in locally without an inbox: `node scripts/dev-signin.mjs <email>` (sends no email).
