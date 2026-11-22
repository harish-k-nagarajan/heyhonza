# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People who want to learn or maintain Czech through short, daily interactions—especially on the phone—without the feel of a generic flashcard product. The experience should feel human, warm, and a bit funny, while staying focused on useful language practice.

## Product Purpose

Honza is a mobile-first, installable Czech-learning PWA. Learners practice real Czech in conversation with **Honza**, an AI persona who behaves like a friendly tutor and conversation partner.

Core loop:

1. Honza initiates contact (writes first; spoken call is also in scope).
2. The learner replies in Czech — typed in `/chat`, spoken in `/call`.
3. Honza responds with corrections, encouragement, and the next conversational beat.

Success means habitual practice driven by Honza’s presence, not passive content consumption.

## Positioning

Character-led conversational practice: the tutor persona *is* the product. Continuity (history, level, topics, optional Google Doc context) follows the signed-in learner. Neighboring flashcard or drill apps cannot truthfully claim the same “Honza opens and continues a real Czech conversation with you” mechanism.

## Operating Context

- Primary surface: phone-width PWA (~430px stage on desktop).
- Modes: typed chat and spoken call; shared transcript history.
- First-run: welcome → sign-in → onboarding (level, topics, optional Google Doc URL).
- Settings: preferences, context URL, model options, reset that clears history and re-runs onboarding.
- Auth/data: Supabase email+password with confirmation; Postgres with own-row RLS. Without Supabase, localStorage-backed stores still run the UI.

## Capabilities and Constraints

**In scope**

- Welcome, sign-in, onboarding, home/chat, call, settings.
- LLM replies via OpenRouter through Next.js Route Handlers only.
- TTS via ElevenLabs through `/api/tts` only (server-side key).
- STT in-browser via Web Speech API (`cs-CZ`) on call.
- Google Doc context via public URL fetch (no OAuth).
- PWA install affordances.

**Out of scope**

- Scheduling / calendar-style reminders beyond what the OS/browser already provides.
- Social features (friends, leaderboards, sharing).

**Hard technical constraints**

- Secrets only in env (Vercel / `.env.local`); never in client or repo.
- No LLM or TTS provider calls from the browser; no provider keys in the client bundle.
- Middleware must live under `src/` for App Router detection.

**Undecided / external**

- Custom SMTP for real learners (pre-launch).
- Paid ElevenLabs plan if Czech-native library voices are required (free tier limitation).
- Push: subscribe + scheduled send via `/api/cron/check-ins` and VAPID. Phone alerts need an installed PWA, GitHub Action `CRON_SECRET` (Hobby Vercel is daily-only), and `SUPABASE_SERVICE_ROLE_KEY` on the server.

## Brand Commitments

- Product/character name: **Honza**.
- The character is the app: primary surfaces lead with Honza; he is not a small decorative icon on those screens.
- In-app teaching copy and chat: Czech; marketing landing: English (Czech only in showcase samples), unless a future brief changes that.
- Visual system is documented separately in `DESIGN.md` (Fern Mist O4, Doto and Inter). PRODUCT.md does not own aesthetics.

## Evidence on Hand

- Product intent: `CONTEXT.md`
- Visual system: `DESIGN.md`
- Do not fabricate testimonials, benchmarks, pricing, or press.

## Product Principles

1. **Presence over curriculum chrome** — Honza initiates and carries the loop; UI serves the conversation.
2. **Practice in Czech, not about Czech** — replies are real language use; corrections stay gentle and in-flow.
3. **Mobile-first continuity** — short sessions on phone, with history that survives re-login when auth is configured.
4. **Server-bound intelligence** — models and voice stay behind Route Handlers; the client never holds provider secrets.
5. **Honest scope** — no scheduling or social until explicitly brought in; degrade gracefully when optional keys are missing.

## Accessibility & Inclusion

Respect `prefers-reduced-motion` for orb, dock, and page transitions. No separate audited WCAG target is recorded beyond that product-specific requirement.
