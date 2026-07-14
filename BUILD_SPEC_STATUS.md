# Honza — BUILD_SPEC status tracker (`BUILD_SPEC_STATUS.md`)

Live status of every [`BUILD_SPEC.md`](BUILD_SPEC.md) phase (BUILD_SPEC's own phase
numbers — these differ from `TASKS.md`'s numbering).

> **Maintenance rule:** update this table as each phase's verification gate passes for
> real in the running app. **The end goal is every row ✅ — the project is not done
> until this whole table is green.** Keep it in sync with `TASKS.md` / `MEMORY.md`.

**Legend:** ✅ done & verified · 🟡 partial · ❌ not built

_Last updated: 2026-07-14 (after Phase 4 PWA polish + live OpenRouter verification)_

| BS Phase | Status | Gap / what's left |
|---|---|---|
| 0 · Inventory & reconciliation | ✅ | — |
| 1 · Auth + user identity | 🟡 | Code done (Supabase magic link). Real end-to-end gate (click a live email, second user separate) unverified — needs a human email click. |
| 2 · Honza state machine | 🟡 | `HonzaOrb` renders all 5 states, but state is a **per-component prop** — no shared Zustand mood store, no app-wide background tint. |
| 3 · Conversation engine (LLM) | ✅ | OpenRouter engine, hardened; **live chat round-trip confirmed** on `openai/gpt-4o-mini`. |
| 4 · Chat screen | 🟡 | UI + live replies work, but **history is client-side only — no per-user DB persistence** (gate needs refresh/re-login survival, separate per user). |
| 5 · Context ingestion + Settings | 🟡 | Google-Doc fetch + Settings exist, but context is **client-side, not DB-backed per user** with a "last synced" state; engine reads context from the client, not a store. |
| 6 · Onboarding flow | 🟡 | Works, but gated on a **client flag, not the DB `onboarding_completed`** record; must share one data model with Settings. |
| 7 · Home screen | 🟡 | Hero orb + chat entry exist, but **"Honza initiates" — the unprompted opener generated on load — is not built** (the core differentiator). Home doesn't call the engine. |
| 8 · Voice call (STT/TTS) | ❌ | No `/call` route, no STT/TTS — only a `VoiceReplyButton` stub. Needs Harish's OK + a TTS key (e.g. ElevenLabs). |
| 9 · Landing page + polish pass | ❌ | No unauthenticated marketing page. PWA install ✅ (Phase 4). Full DESIGN.md polish spot-check across all screens pending. |
| Leftover primitives | ❌ | `Toggle` component (a11y pill) + token audit still unchecked in `TASKS.md` Phase 1. |

## Notes

- **The through-line:** the biggest gap is **DB persistence**. Chat history, context/doc
  content, and the onboarding flag currently live in `localStorage`; BUILD_SPEC's data
  doctrine (§5) and the Phase 4/5/6 gates all require per-user Supabase storage. Only the
  `profiles` table exists today (`supabase/migrations/0001_profiles.sql`).
- **Unblocked spine (do next):** Phase 2 shared mood store + app-wide tint, the DB
  persistence layer (Phases 4/5/6), and Phase 7 Home initiation. All are unblocked —
  Supabase is provisioned and `OPENROUTER_API_KEY` is in local `.env.local`.
- **Tail-end / gated:** Phase 8 (voice) needs Harish's OK + a TTS key; Phase 9 (landing +
  polish) is independent; Phase 1's real magic-link verification needs a human email click.
