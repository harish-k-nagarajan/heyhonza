# Honza — BUILD_SPEC status tracker (`BUILD_SPEC_STATUS.md`)

Live status of every [`BUILD_SPEC.md`](BUILD_SPEC.md) phase (BUILD_SPEC's own phase
numbers — these differ from `TASKS.md`'s numbering).

> **Maintenance rule:** update this table as each phase's verification gate passes for
> real in the running app. **The end goal is every row ✅ — the project is not done
> until this whole table is green.** Keep it in sync with `TASKS.md` / `MEMORY.md`.

**Legend:** ✅ done & verified · 🟡 partial · ❌ not built

_Last updated: 2026-07-15 (after Phase 2 mood store + app-wide tint, DB persistence layer, Phase 7 Home initiation)_

| BS Phase | Status | Gap / what's left |
|---|---|---|
| 0 · Inventory & reconciliation | ✅ | — |
| 1 · Auth + user identity | 🟡 | Code done (Supabase magic link). Real end-to-end gate (click a live email, second user separate) unverified — needs a human email click. |
| 2 · Honza state machine | ✅ | Shared `useMoodStore` drives Honza's face **and** the app-wide background + `--accent` tint (AppShell). **Verified live at 375px:** dev cycler + a real chat event both shift the whole app (thinking→blue, speaking→green) and recolor accent UI. Dev cycler gated behind `NEXT_PUBLIC_HONZA_DEV_TOOLS`. |
| 3 · Conversation engine (LLM) | ✅ | OpenRouter engine, hardened; **live chat round-trip confirmed** on `openai/gpt-4o-mini`. Now also reads context/topics/level from the DB when a user is signed in, and exposes `buildOpenerPrompt` for Phase 7. |
| 4 · Chat screen | 🟡 | **DB persistence layer built:** `messages` table (per user, `kind` chat/call, RLS own-row), `/api/chat` persists turns + `/api/state` hydrates history, `ServerSync` loads it into the store. **localStorage fallback verified live** (refresh keeps thread; opener→correct→explain→continue works). The **DB survive-refresh/re-login/separate-user gate needs live Supabase** — same human blocker as Phase 1. |
| 5 · Context ingestion + Settings | 🟡 | **Built:** `user_context` table (RLS own-row, ingestion timestamp), Settings shows **"Last synced …"**, engine reads context **from the DB** server-side (not the client) when signed in. Google-Doc fetch + fallback verified live. DB round-trip (paste doc → reflected across re-login) needs live Supabase. |
| 6 · Onboarding flow | 🟡 | **Built:** onboarding writes the same Settings fields (topics/level) + `onboarding_completed` to `profiles`; the gate reads DB truth via `ServerSync` (pages wait on `useSyncStore.checked`). One data model shared with Settings. DB gate (new user forced through, returning user skips) needs live Supabase. |
| 7 · Home screen | ✅ | **"Honza initiates" built + verified live at 375px:** on load Home calls the engine (`buildOpenerPrompt`, time-of-day + time-since-last-contact aware) and surfaces a real unprompted Czech opener ("Ahoj! Jsem Honza…") — no blank thread, no typing first. Same thread flows into Chat (no double-bootstrap). *Note: the "Call" entry point lands with Phase 8.* |
| 8 · Voice call (STT/TTS) | ❌ | No `/call` route, no STT/TTS — only a `VoiceReplyButton` stub. `messages.kind` already has a `call` tag ready. Needs Harish's OK + a TTS key (e.g. ElevenLabs). |
| 9 · Landing page + polish pass | ❌ | No unauthenticated marketing page. PWA install ✅ (Phase 4). Full DESIGN.md polish spot-check across all screens pending. |
| Leftover primitives | ❌ | `Toggle` component (a11y pill) + token audit still unchecked in `TASKS.md` Phase 1. |

## Notes

- **DB persistence is now built end-to-end** but runs in **fallback mode** locally. The
  architecture is one code path, two modes: `/api/state` answers `persisted:true` only when
  Supabase is configured **and** a real user is signed in; until then every write no-ops and
  the localStorage-backed Zustand stores are authoritative (so screens run with no auth
  locally). Migrations `0002_conversations_and_context.sql` add `messages` + `user_context`
  (+ settings columns on `profiles`), all RLS own-row like `profiles`.
- **What's verifiable without Supabase was verified live** (Phase 2 tint, Phase 3 engine,
  Phase 7 initiation, chat tutor loop, refresh survival). **What needs live Supabase** is the
  three DB gates (4/5/6) — the same human blocker as Phase 1's magic-link click. Apply the two
  migrations in the Supabase SQL editor, set `NEXT_PUBLIC_SUPABASE_*`, then re-walk: send →
  refresh → re-login (history persists), second email = empty separate history.
- **Tail-end / gated:** Phase 8 (voice) needs Harish's OK + a TTS key; Phase 9 (landing +
  polish) is independent.
