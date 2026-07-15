# Honza — BUILD_SPEC status tracker (`BUILD_SPEC_STATUS.md`)

Live status of every [`BUILD_SPEC.md`](BUILD_SPEC.md) phase (BUILD_SPEC's own phase
numbers — these differ from `TASKS.md`'s numbering).

> **Maintenance rule:** update this table as each phase's verification gate passes for
> real in the running app. **The end goal is every row ✅ — the project is not done
> until this whole table is green.** Keep it in sync with `TASKS.md` / `MEMORY.md`.

**Legend:** ✅ done & verified · 🟡 partial · ❌ not built

_Last updated: 2026-07-15 (all three remaining DB gates closed — rows 1/4/5/6 now ✅)_

> **✅ Every DB gate is now verified live.** The last three — re-login persistence,
> returning-user-skips-onboarding, and second-user isolation — were walked end-to-end
> against live Supabase and are closed. Rows 1, 4, 5 and 6 are ✅.
>
> **The email rate limit is no longer a blocker, and no SMTP setup was needed.** The
> built-in sender's ~2/hour cap was never the real constraint: the admin
> `generate_link` endpoint mints the *same* one-time token and returns it directly
> **without sending mail**, so it has no cap. That's now `scripts/dev-signin.mjs`
> (needs `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`). Sign-in is now a one-liner and
> costs zero emails — see "How to sign in headlessly" below.
>
> **Remaining non-green rows are both deliberate, not gaps:** Phase 8 (voice) needs a
> TTS key + Harish's go-ahead, and `Toggle` is deferred until a screen actually has a
> toggle. Custom SMTP is still worth doing before production (Supabase says the
> built-in sender isn't for production use), but it no longer blocks any testing.

| BS Phase | Status | Gap / what's left |
|---|---|---|
| 0 · Inventory & reconciliation | ✅ | — |
| 1 · Auth + user identity | ✅ | **Auth is email+password + email confirmation** (Harish, 2026-07-15 — magic link cost an email per sign-in; see MEMORY.md §3 for why not Clerk/Google). `/auth/callback` unchanged, now serving the confirmation link. **Verified live:** session → `persisted:true`, `0001` trigger created the profile row, sign-out clears (`persisted:false`), RLS rejects anon writes (`42501`), routing correct, and the new form's validation guards. **Password sign-up → confirm → sign-in round-trip verified by Harish** on `harishnokia@gmail.com` (2026-07-15, reported not Claude-observed — Claude doesn't enter passwords). **Last gap now closed: second user = separate empty record** — signed in as user B in the same browser directly after user A: `persisted:true`, **0 messages, 0 context chars, no doc bleed**, `onboardingCompleted:false`. |
| 2 · Honza state machine | ✅ | Shared `useMoodStore` drives Honza's face **and** the app-wide background + `--accent` tint (AppShell). **Verified live at 375px:** dev cycler + a real chat event both shift the whole app (thinking→blue, speaking→green) and recolor accent UI. Dev cycler gated behind `NEXT_PUBLIC_HONZA_DEV_TOOLS`. |
| 3 · Conversation engine (LLM) | ✅ | OpenRouter engine, hardened; **live chat round-trip confirmed** on `openai/gpt-4o-mini`. Now also reads context/topics/level from the DB when a user is signed in, and exposes `buildOpenerPrompt` for Phase 7. |
| 4 · Chat screen | ✅ | **DB persistence VERIFIED live:** signed-in turns wrote 3 rows to `messages` (`kind:'chat'`), and a **hard refresh re-rendered the whole thread from the DB** (not localStorage — the DB's empty profile visibly overrode stale local values on hydrate). **Last gap now closed: history survives a re-login.** Signed out, **cleared `localStorage` entirely**, signed back in as user A: all 3 messages re-rendered from the DB with local storage provably empty, so the fallback cannot explain it. A new turn sent in that fresh session persisted too (`messages` 3 → 5). |
| 5 · Context ingestion + Settings | ✅ | **VERIFIED live:** a real public Google Doc fetched server-side (2,902 chars of Czech vocab) → stored in `user_context` → **reached the engine**: Honza spontaneously quizzed with *"Jak se řekne 'airport' česky?"* and `Letiště – Airport` is line 1 of that doc. DB-backed topics also steered the opener (picked "food" → he asked about food). **Last gap now closed: the doc is still referenced across a re-login.** After a full sign-out + `localStorage` clear + re-login, `/api/state` returned the same 2,902 chars (first lines still `Letiště – Airport` / `Nádraží – Train station` / `Lékárna – Pharmacy`), and a **freshly generated** turn quizzed *"Jak se česky řekne „restaurant"?"* — `Restaurace` is in that doc, so this is new output from doc context, not replayed history. |
| 6 · Onboarding flow | ✅ | **VERIFIED live:** a brand-new user was **forced through onboarding from DB truth** (`onboarding_completed:false` → `/`→`/onboarding`), and completing it persisted `level:'B1'` + `topics:['food']` to `profiles`. **Last gap now closed: returning user skips onboarding.** User A (`onboardingCompleted:true`) re-logged in and landed on **`/`**, not `/onboarding`. Verified in both directions in the same browser minutes apart: user B (`false`) *was* routed to `/onboarding` — so the routing is reading DB truth, not passing by accident. |
| 7 · Home screen | ✅ | **"Honza initiates" built + verified live at 375px:** on load Home calls the engine (`buildOpenerPrompt`, time-of-day + time-since-last-contact aware) and surfaces a real unprompted Czech opener ("Ahoj! Jsem Honza…") — no blank thread, no typing first. Same thread flows into Chat (no double-bootstrap). *Note: the "Call" entry point lands with Phase 8.* |
| 8 · Voice call (STT/TTS) | 🟡 | **The phase outcome — a real spoken conversation — is not built.** But **STT is not missing, contrary to this row's earlier text.** `VoiceReplyButton` is a genuine Web Speech API integration (`lang: 'cs-CZ'`, `onresult` → `sendUserTurn`), wired into the chat composer — **built but never verified live** (a headless pane can't drive a mic). It is *not* a stub; don't rebuild it. **Actually missing:** (a) the `/call` screen, framed as a live call rather than a text thread; (b) **TTS so Honza is audible** — server-side route only, key never client-side, with a code comment on swapping providers; (c) transcripts persisted to the same history tagged `kind:'call'` (column already exists) and rendered in Chat as a labeled call transcript. **Needs Harish's OK + a TTS key** (e.g. ElevenLabs) — **re-checked 2026-07-15 (third independent check): still no TTS key.** Not in `.env.local`, `.env.development.local`, `.env.example`, the shell env, or anywhere in the repo — and **Harish has confirmed he has no ElevenLabs account or project set up at all**, so the key cannot simply be pasted in; the provider account is step zero (checked, not assumed). **When verifying:** the mic/audio half can't be driven from the browser pane — verify the server half for real (route returns audio, no key in any client bundle or devtools request, `kind:'call'` rows land, transcript renders) and hand Harish an explicit manual checklist for the rest. Don't claim the mic/audio half as verified. |
| 9 · Landing page + polish pass | ✅ | **`/welcome` front door built + verified live** (hero orb, three-step loop, real topic/level chips from `lib/constants` — no invented sample data; honest about the no-push seam). Middleware now sends signed-out `/`→`/welcome` instead of a bare login form; **redirect table verified for real**. PWA manifest + icons confirmed serving. **DESIGN.md pass across every screen:** killed `Card`'s legacy `shadow-black/40`, the faux-bold headings, onboarding's undersized orb + `tracking-tight`, and gave Settings a character (it had none). Learner-facing copy replaced the leaked "API key stays on the server (Vercel env)" build notes. |
| Leftover primitives | 🟡 | **Token audit ✅ done** in the Phase 9 pass (no `dark:`/Inter/stray palettes left; fixed the shadow + faux-bold). **`Toggle` deliberately deferred** — no screen has an on/off toggle (pills + a select), so it'd be an unused component; build it when a real toggle appears. |

## Notes

- **DB persistence is now built end-to-end** but runs in **fallback mode** locally. The
  architecture is one code path, two modes: `/api/state` answers `persisted:true` only when
  Supabase is configured **and** a real user is signed in; until then every write no-ops and
  the localStorage-backed Zustand stores are authoritative (so screens run with no auth
  locally). Migrations `0002_conversations_and_context.sql` add `messages` + `user_context`
  (+ settings columns on `profiles`), all RLS own-row like `profiles`.
- **All DB gates (1/4/5/6) are now closed against live Supabase** — see the rows above for
  the specific evidence behind each. The decisive move for 4/5 was clearing `localStorage`
  before re-login, which removes the fallback as an explanation for anything that renders.
- **Tail-end / gated:** Phase 8 (voice) needs Harish's OK + a TTS key — as of 2026-07-15
  no TTS key of any kind is in `.env.local` (checked, not assumed), and the OK was a
  "[maybe]", so the phase hasn't been worked. `messages.kind` already carries a `call` tag,
  and `VoiceReplyButton` already does real Web Speech STT — **the missing half is TTS plus
  the `/call` screen**, not speech recognition. See row 8 before planning it.

- **Custom SMTP is still a production to-do, but no longer a testing blocker.** Supabase's
  built-in sender is capped at ~2 messages/hour, can't be raised, and locks template
  editing; Supabase states it isn't for production use. Set up Resend (free tier →
  Authentication → Emails → SMTP Settings) before the Vercel deploy. Local verification
  doesn't need it — `scripts/dev-signin.mjs` sends no email at all.

### How to sign in headlessly (no inbox access)

**Use `scripts/dev-signin.mjs`. It sends no email and has no rate limit.**

```bash
node scripts/dev-signin.mjs <email> [next]   # prints a localhost /auth/callback URL
```

Open that URL in the browser you want the session in. Requires
`SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (Supabase → Project Settings → API →
`service_role`); the key bypasses RLS, so it stays in the gitignored env file and is
never imported by anything under `src/`.

**Why this works.** The email was only ever a delivery mechanism — the one-time token
exists in the DB regardless. The admin `generate_link` endpoint returns that token
directly **without sending mail**, so the built-in sender's ~2/hour cap never applies.
The script asks for `type=magiclink` and hands the resulting `token_hash` to
`/auth/callback`, which calls `verifyOtp` **server-side**.

**Why it beats the old PKCE flow** (previously documented here, now retired): the `code`
flow stores a verifier cookie in the browser that *started* it, so the link only worked
in that one browser and was trivially burned by opening it anywhere else. The
`token_hash` + `verifyOtp` path has no verifier, so **any** browser can redeem it. If a
token is consumed or expires, just run the script again — it costs nothing.

**Browser-pane gotcha:** the pane blocks navigating to the `supabase.co` origin directly,
which is why the script prints a `localhost` callback URL rather than an action link.
