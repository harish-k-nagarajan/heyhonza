# Honza — BUILD_SPEC status tracker (`BUILD_SPEC_STATUS.md`)

Live status of every [`BUILD_SPEC.md`](BUILD_SPEC.md) phase (BUILD_SPEC's own phase
numbers — these differ from `TASKS.md`'s numbering).

> **Maintenance rule:** update this table as each phase's verification gate passes for
> real in the running app. **The end goal is every row ✅ — the project is not done
> until this whole table is green.** Keep it in sync with `TASKS.md` / `MEMORY.md`.

**Legend:** ✅ done & verified · 🟡 partial · ❌ not built

_Last updated: 2026-07-15 (live Supabase connected — most DB gates walked for real)_

> **✅ Live Supabase is now connected and most DB gates are verified.** Both migrations are
> applied (all tables + columns confirmed via REST), RLS is enforced (anonymous insert
> rejected `42501`), and `/api/state` returned **`persisted: true`** for the first time —
> the app is running on the DB, not the localStorage fallback.
>
> **⏳ Three gates remain, all blocked on one thing: Supabase's built-in email sender is
> capped at ~2 messages/hour**, and both were spent. Nothing architectural is blocking —
> re-login persistence, returning-user-skips-onboarding, and second-user isolation each
> need one more magic link. **Fix: custom SMTP** (see Notes).

| BS Phase | Status | Gap / what's left |
|---|---|---|
| 0 · Inventory & reconciliation | ✅ | — |
| 1 · Auth + user identity | 🟡 | **Magic-link login VERIFIED live** against real Supabase: code exchanged → session cookie → `persisted:true`; the `0001` trigger auto-created the profile row; sign-out clears the session; RLS rejects anonymous writes (`42501`). Routing verified (`/`→`/welcome`, protected→`/signin?next=…`). **Only gap: second user = separate record** — needs 1 more magic link (email rate limit). |
| 2 · Honza state machine | ✅ | Shared `useMoodStore` drives Honza's face **and** the app-wide background + `--accent` tint (AppShell). **Verified live at 375px:** dev cycler + a real chat event both shift the whole app (thinking→blue, speaking→green) and recolor accent UI. Dev cycler gated behind `NEXT_PUBLIC_HONZA_DEV_TOOLS`. |
| 3 · Conversation engine (LLM) | ✅ | OpenRouter engine, hardened; **live chat round-trip confirmed** on `openai/gpt-4o-mini`. Now also reads context/topics/level from the DB when a user is signed in, and exposes `buildOpenerPrompt` for Phase 7. |
| 4 · Chat screen | 🟡 | **DB persistence VERIFIED live:** signed-in turns wrote 3 rows to `messages` (`kind:'chat'`), and a **hard refresh re-rendered the whole thread from the DB** (not localStorage — the DB's empty profile visibly overrode stale local values on hydrate). **Only gap: history surviving a re-login** — needs 1 more magic link (email rate limit). |
| 5 · Context ingestion + Settings | 🟡 | **VERIFIED live:** a real public Google Doc fetched server-side (2,902 chars of Czech vocab) → stored in `user_context` → **reached the engine**: Honza spontaneously quizzed with *"Jak se řekne 'airport' česky?"* and `Letiště – Airport` is line 1 of that doc. DB-backed topics also steered the opener (picked "food" → he asked about food). **Only gap: doc still referenced across a re-login** — needs 1 more magic link. |
| 6 · Onboarding flow | 🟡 | **VERIFIED live:** a brand-new user was **forced through onboarding from DB truth** (`onboarding_completed:false` → `/`→`/onboarding`), and completing it persisted `level:'B1'` + `topics:['food']` to `profiles`. **Only gap: returning user skips onboarding** — needs 1 more magic link. |
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

- **The one blocker left is email delivery, not code.** Supabase's **built-in** email sender
  is capped at **~2 messages/hour** and cannot be raised, and it also locks template editing.
  Each remaining gate costs one magic link, so the cap is what's holding rows 1/4/5/6 at 🟡.
  **Fix: custom SMTP** (Resend free tier → Authentication → Emails → SMTP Settings). This is
  needed for production regardless — Supabase states the built-in sender is not for
  production use — so it's on the Vercel critical path anyway, not a testing-only detour.

### How to sign in headlessly (no inbox access) — the technique that worked

Claude can't read Harish's email, and **magic links are single-use and browser-bound**, so
the naive "paste me the link" flow fails. What works:

1. Claude requests the link from `/signin` **in its own browser** (this is essential — the
   PKCE code verifier is stored in a cookie in *that* browser, and `@supabase/ssr` needs it
   server-side to call `exchangeCodeForSession`).
2. Harish runs in the SQL editor:
   `select token_type, token_hash from auth.one_time_tokens order by created_at desc limit 5;`
   — the token exists in the DB the moment the link is requested; **the email is only a
   delivery mechanism and can be ignored entirely**.
3. Claude resolves the verify redirect server-side, which yields a one-time `code`:
   `curl -sD - "$SUPABASE_URL/auth/v1/verify?token=<token_hash>&type=magiclink&redirect_to=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback%3Fnext%3D%252F"`
   (`type=magiclink` for an existing user — a magic-link token is stored as
   `token_type=recovery_token`; `type=signup` only for a brand-new unconfirmed user.)
4. Claude navigates its browser to the returned `…/auth/callback?code=…` → session cookie.

**Do not let anyone open the link before step 3** — clicking it in another browser consumes
the token *and* fails (no verifier there), leaving `otp_expired`. That burned the first
email of the session. The Browser pane also blocks navigating to the `supabase.co` origin
directly, which is why step 3 uses curl.
