# Honza — BUILD_SPEC status tracker (`BUILD_SPEC_STATUS.md`)

Live status of every [`BUILD_SPEC.md`](BUILD_SPEC.md) phase (BUILD_SPEC's own phase
numbers — these differ from `TASKS.md`'s numbering).

> **Maintenance rule:** update this table as each phase's verification gate passes for
> real in the running app. **The end goal is every row ✅ — the project is not done
> until this whole table is green.** Keep it in sync with `TASKS.md` / `MEMORY.md`.

**Legend:** ✅ done & verified · 🟡 partial · ❌ not built

_Last updated: 2026-07-15 (after Phase 9 landing page + DESIGN.md polish pass)_

> **⚠️ Live Supabase is still not configured.** The 2026-07-15 session opened with the
> understanding that migrations had been applied and `NEXT_PUBLIC_SUPABASE_*` set in
> `.env.local`. They were not: `.env.local` holds only `OPENROUTER_API_KEY` +
> `HONZA_DEFAULT_MODEL`, and no Supabase vars exist in any env file or the shell. So the
> Phase 1/4/5/6 DB gates **still cannot be walked** and stay 🟡. The migration SQL sitting
> in `supabase/migrations/` says nothing about whether it was run in the SQL editor.

| BS Phase | Status | Gap / what's left |
|---|---|---|
| 0 · Inventory & reconciliation | ✅ | — |
| 1 · Auth + user identity | 🟡 | Code done (Supabase magic link). **Routing is now verified** (signed-out `/`→`/welcome`, protected routes→`/signin?next=…`, tested with throwaway keys). Still unverified: the actual magic-link email click + a second user being separate — needs live Supabase keys. |
| 2 · Honza state machine | ✅ | Shared `useMoodStore` drives Honza's face **and** the app-wide background + `--accent` tint (AppShell). **Verified live at 375px:** dev cycler + a real chat event both shift the whole app (thinking→blue, speaking→green) and recolor accent UI. Dev cycler gated behind `NEXT_PUBLIC_HONZA_DEV_TOOLS`. |
| 3 · Conversation engine (LLM) | ✅ | OpenRouter engine, hardened; **live chat round-trip confirmed** on `openai/gpt-4o-mini`. Now also reads context/topics/level from the DB when a user is signed in, and exposes `buildOpenerPrompt` for Phase 7. |
| 4 · Chat screen | 🟡 | **DB persistence layer built:** `messages` table (per user, `kind` chat/call, RLS own-row), `/api/chat` persists turns + `/api/state` hydrates history, `ServerSync` loads it into the store. **localStorage fallback verified live** (refresh keeps thread; opener→correct→explain→continue works). The **DB survive-refresh/re-login/separate-user gate needs live Supabase** — same human blocker as Phase 1. |
| 5 · Context ingestion + Settings | 🟡 | **Built:** `user_context` table (RLS own-row, ingestion timestamp), Settings shows **"Last synced …"**, engine reads context **from the DB** server-side (not the client) when signed in. Google-Doc fetch + fallback verified live. DB round-trip (paste doc → reflected across re-login) needs live Supabase. |
| 6 · Onboarding flow | 🟡 | **Built:** onboarding writes the same Settings fields (topics/level) + `onboarding_completed` to `profiles`; the gate reads DB truth via `ServerSync` (pages wait on `useSyncStore.checked`). One data model shared with Settings. DB gate (new user forced through, returning user skips) needs live Supabase. |
| 7 · Home screen | ✅ | **"Honza initiates" built + verified live at 375px:** on load Home calls the engine (`buildOpenerPrompt`, time-of-day + time-since-last-contact aware) and surfaces a real unprompted Czech opener ("Ahoj! Jsem Honza…") — no blank thread, no typing first. Same thread flows into Chat (no double-bootstrap). *Note: the "Call" entry point lands with Phase 8.* |
| 8 · Voice call (STT/TTS) | ❌ | No `/call` route, no STT/TTS — only a `VoiceReplyButton` stub. `messages.kind` already has a `call` tag ready. Needs Harish's OK + a TTS key (e.g. ElevenLabs). |
| 9 · Landing page + polish pass | ✅ | **`/welcome` front door built + verified live** (hero orb, three-step loop, real topic/level chips from `lib/constants` — no invented sample data; honest about the no-push seam). Middleware now sends signed-out `/`→`/welcome` instead of a bare login form; **redirect table verified for real**. PWA manifest + icons confirmed serving. **DESIGN.md pass across every screen:** killed `Card`'s legacy `shadow-black/40`, the faux-bold headings, onboarding's undersized orb + `tracking-tight`, and gave Settings a character (it had none). Learner-facing copy replaced the leaked "API key stays on the server (Vercel env)" build notes. |
| Leftover primitives | 🟡 | **Token audit ✅ done** in the Phase 9 pass (no `dark:`/Inter/stray palettes left; fixed the shadow + faux-bold). **`Toggle` deliberately deferred** — no screen has an on/off toggle (pills + a select), so it'd be an unused component; build it when a real toggle appears. |

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
- **Tail-end / gated:** Phase 8 (voice) needs Harish's OK + a TTS key — as of 2026-07-15
  neither `ELEVENLABS_API_KEY` nor any TTS key is in `.env.local`, and the OK was a
  "[maybe]", so it wasn't started. `messages.kind` already carries a `call` tag for it.

- **The only thing between this table and all-green is live Supabase.** Everything not
  gated on it is done and verified. To close rows 1/4/5/6 in one sitting: apply
  `0001_profiles.sql` then `0002_conversations_and_context.sql` in the Supabase SQL editor,
  put `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`, set the
  Auth redirect to `/auth/callback`, then walk: magic-link login → send a chat → refresh →
  re-login (history persists) · a second email = separate empty history · paste a public
  Google Doc → Honza references it across a re-login · a new user is forced through
  onboarding while a returning one skips it.
- **Verifying auth routing without live Supabase:** temporarily appending *dummy*
  `NEXT_PUBLIC_SUPABASE_*` values does exercise the middleware's redirect branches (it
  doesn't 500), which is how the Phase 9 front-door table was verified. It cannot test
  anything past the redirect — a fake project can't send an email. Restore `.env.local`
  afterwards or every screen stays locked to `/signin`.
