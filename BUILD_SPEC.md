# Honza — Build Spec for Claude Code

## 1. Outcome narrative

It's a Tuesday morning in Prague. I'm making coffee when my phone buzzes — not a notification banner, but Honza's face on the lock screen, mid-thought. I open the app and he's already written to me: *"Dobré ráno! Slyšel jsem, že dneska prší. Máš deštník?"* I didn't schedule this. I didn't open a "lesson." Honza just noticed it's morning and started talking to me, the way a Czech friend would text me about the weather. I type back my best attempt at Czech, get it half-wrong, and he responds in a way that shows me the correct phrase without lecturing me — the way a patient friend corrects you mid-conversation, not the way a red X on Duolingo does.

Later that day I'm on the tram and Honza calls me — a real voice call, his synthesized Czech voice, asking how my day is going. I speak back out loud, my phone listening and transcribing, and we have an actual halting conversation. It's awkward. It's real. It's the only Czech speaking practice I get outside my weekly lesson.

That evening I paste in a link to a Google Doc — vocabulary and topics my human teacher covered this week (dealing with the pharmacy, since I mentioned a mix-up buying medicine). Honza reads it, and for the next few days his messages start weaving in those exact words and situations, so what I learned on Monday shows up unprompted on Wednesday, in context, the way real retention works.

I open the app and land on a home screen where Honza — a dot-matrix face, mood-reactive, cream background — is the only thing that matters. Not a dashboard. Not streaks and gamification. Just him, present, initiating. Settings let me control which topics he draws from, how often he reaches out, and swap in a new Google Doc when my teacher covers something new. I signed up once with a magic link, no password to remember, and I've never had to think about accounts again.

## 2. Scope fence

**Persona:** Single persona — the adult expat learner (Harish's own situation: lives in Czechia, has a human teacher, wants ambient practice between lessons). No teacher-side persona, no multi-user classroom features.

**Navigation skeleton:**
- Landing/marketing page (unauthenticated) → magic link auth
- Onboarding (first login only): name, Czech level, topic interests, optional Google Doc URL
- Home (the hero screen — Honza, his current state, entry points to chat/call)
- Chat (threaded conversation with Honza, Czech input, correction surfacing)
- Call (voice conversation UI — active call screen with live transcript)
- Settings (topics, Google Doc management, contact frequency, account, sign out)

**Explicit OUT of scope for v1:**
- Multiple Google Docs or a document library — one active doc at a time is enough; multi-doc management is a v2 problem.
- Push notifications / native background scheduling — Honza "initiating" in v1 means the message/call is waiting when you open the app or is triggerable on a timer while the tab/PWA is open, not OS-level push. (Flag this honestly in the UI rather than faking it — see integration doctrine.)
- Spaced-repetition or vocabulary SRS system — Honza referencing the Google Doc content is the retention mechanism for v1, not a flashcard engine.
- Social features, leaderboards, streak gamification — explicitly against the product's own philosophy (not Duolingo).
- Payment/billing — no subscription logic in v1.
- Admin/teacher dashboard — out of scope entirely.
- Android/iOS native builds — PWA only, per existing stack decision.

**Definition of done:** A stranger can land on the marketing page, sign up via magic link, complete onboarding (including pasting a Google Doc URL), reach the home screen and see Honza in his idle state, tap into a chat and exchange at least one real AI-generated message pair, start a voice call and have a real spoken back-and-forth with STT/TTS working, revisit Settings and change their topics or swap the Google Doc, sign out, and sign back in via a fresh magic link to find their data (chat history, settings, doc) intact. No dead links, no screens that render but do nothing, no hardcoded conversation content.

## 3. Primitives before features (the spine)

Build order is non-negotiable. If a phase-3 feature is attempted before its phase-1 primitive exists, that is a build error, not initiative.

The spine is four primitives, not the screens:

1. **Auth + user identity layer.** Magic link sign-in producing a persistent user session and a `users` record. Every other primitive hangs data off this user ID. Nothing else gets built against a fake/anonymous user.

2. **Honza state machine.** A single source of truth for Honza's mood/state (`idle`, `thinking`, `speaking`, `happy`, `oops`) that both the chat UI and the visual character component subscribe to. This is not a per-screen animation trick — it must be one state store (per DESIGN.md's mood-reactive system) that any screen can read and any AI response can drive. Build this before building the chat screen or the home screen, because both depend on it and a refactor here later touches everything.

3. **Conversation engine (LLM adapter).** One service function — not scattered `fetch` calls — that takes conversation history + user context (topics, active Google Doc content, level) and returns Honza's next message, routed server-side through a Next.js Route Handler, using OpenRouter as the model gateway (so the model itself is swappable via config, not hardcoded to one vendor). All chat messages and call turns go through this one function. This is the primitive that makes "Honza references what I learned Monday" possible — it must accept injected context, not just raw chat history.

4. **Context ingestion pipeline.** A function that takes a public Google Doc URL, fetches and parses it into plain text, and stores it associated with the user, tagged with when it was ingested. The conversation engine (#3) reads from this store. Build the ingestion primitive before building the Settings screen that exposes it — the screen is just a thin UI over this function.

Test for each: if a later phase needs to reshape this primitive to work, that's the signal it was correctly identified as a primitive up front.

## 4. Phased dependency graph

### Phase 0: Repo inventory and reconciliation
**Outcome:** Claude Code understands exactly what already exists before writing anything.
**Depends on:** nothing.
**What gets built:** Nothing — this is a read-only phase. Read every file in the repo root and relevant subfolders. Specifically locate and read `CONTEXT.md`, `DESIGN.md`, `TASKS.md`, `MEMORY.md`, and `.cursorrules` if present, plus any existing components, pages, or design reference images/screenshots in the repo. Produce a short internal summary (can be a comment in your first commit message or a scratch note) of: what's already scaffolded, what design tokens/components already exist and match DESIGN.md, and what's stubbed or broken.
**Verification gate:**
- You can state which of the four primitives in section 3 already exist in some form vs. need to be built from scratch.
- You can confirm the design tokens you'll use match what's in DESIGN.md (cream `#F5F2EE` base, Share Tech Mono, dot-matrix Honza character, mood-reactive color system) rather than inventing new ones.
- If DESIGN.md conflicts with what's actually in the code (e.g. dark mode remnants from an earlier direction), flag it and default to DESIGN.md as source of truth.

### Phase 1: Auth + user identity primitive
**Outcome:** A real user can sign up and sign back in via magic link, with a persisting session.
**Depends on:** Phase 0.
**What gets built:** Database table for users (email, name, created_at, onboarding_completed flag). Magic link email flow (an auth provider that supports passwordless email — e.g. NextAuth/Auth.js with an email provider, or Supabase Auth magic links — pick whichever integrates cleanest with the existing Next.js 14 App Router scaffold found in Phase 0). Session handling via Route Handlers/middleware so authenticated pages are actually protected.
**Verification gate:**
- Enter an email on the landing page, receive a real magic link email, click it, land authenticated on the app.
- Refresh the page — session persists, not logged out.
- Sign out — redirected to landing, protected routes now redirect to sign-in.
- A second real email address produces a fully separate user record with no data bleed.

### Phase 2: Honza state machine + character component
**Outcome:** One state store drives Honza's visual mood everywhere he appears.
**Depends on:** Phase 0 (design tokens).
**What gets built:** A Zustand store (per existing stack) holding Honza's current state (`idle | thinking | speaking | happy | oops`) and any metadata needed to color the mood-reactive background/accent per DESIGN.md. The dot-matrix Honza character component, built from rounded rectangles per DESIGN.md, reading from this store, sized appropriately per screen (200px hero on home, smaller elsewhere). A dev-only test harness (a hidden route or Storybook-style page is fine) to manually cycle through all five states and visually confirm each renders correctly — remove or gate this before calling the phase done if it would confuse a real user.
**Verification gate:**
- Triggering each of the five states updates both the character's appearance and the background/accent tint app-wide, not just locally on one screen.
- The component renders correctly at 200px (home hero) and at a smaller nav/header size without breaking proportions.
- No hardcoded state — everything flows through the one store.

### Phase 3: Conversation engine (LLM adapter)
**Outcome:** A real, working Route Handler that generates Honza's replies using live model calls.
**Depends on:** Phase 1 (need a user to attach context to), Phase 2 (the engine's output should drive Honza's state — e.g. `thinking` while awaiting a response, `speaking` when it returns).
**What gets built:** A single server-side service (e.g. `lib/conversation-engine.ts`) called by Route Handlers, never called directly from client components. It accepts: message history, user's topic preferences, active Google Doc context (empty/null is valid at this phase, wired up fully in Phase 5), and target Czech level. It calls OpenRouter with a sensible default model (pick one reasonable for conversational, correction-aware dialogue — note the choice and why in a code comment so it's easy to swap later) and returns Honza's reply plus any structured correction/explanation data the UI will need. API key read only from environment variables, never hardcoded, never sent to the client.
**Verification gate:**
- Sending a real message through this engine returns a real, non-canned LLM response — not a hardcoded string.
- The engine correctly triggers `thinking` state on request and `speaking`/`happy`/`oops` on response, observable in the UI.
- Removing the API key from env and restarting causes a clear server-side error, not a silent fallback to fake data — confirming there's no hidden mock behind it.

### Phase 4: Chat screen
**Outcome:** A full, real chat experience with Honza.
**Depends on:** Phase 1, 2, 3.
**What gets built:** Chat UI — message thread (Honza's messages left-aligned, user's right-aligned, Share Tech Mono font per DESIGN.md), Czech text input, message persistence to the database per user so history survives refresh/re-login. Corrections or gentle nudges from the LLM (Phase 3) surfaced visibly but not as a red-X grading UI — per the product's own anti-Duolingo philosophy, style this as a natural inline clarification, not a scorecard.
**Verification gate:**
- Send a message, get a real reply, refresh the page, full history is still there.
- Sign out, sign back in as the same user, chat history persists.
- A second test user has a completely separate, empty chat history.
- Honza's character (Phase 2) visibly changes state through the send/receive cycle.

### Phase 5: Context ingestion pipeline + Settings screen
**Outcome:** A user can paste a Google Doc URL and have Honza's conversation actually reflect it.
**Depends on:** Phase 1, Phase 3 (engine must accept this context input, built as a null-safe param in Phase 3).
**What gets built:** Server-side function that fetches a public Google Doc (exported as plain text via its public URL, no OAuth per existing decision), stores the parsed content against the user with an ingestion timestamp. Settings screen: topic preference selection, Google Doc URL input with a visible "last synced" state, contact frequency preference, sign-out control. Wire the conversation engine (Phase 3) to actually pull this stored content into its context on every new message/call.
**Verification gate:**
- Paste a real public Google Doc URL, see confirmation it was ingested (not just "URL saved" — actual content pulled).
- Send a chat message on a topic covered in the doc; the LLM reply demonstrably references or uses vocabulary from that doc content (not generic).
- Replacing the doc URL with a new one and re-syncing updates what the engine references going forward.
- Changing topic preferences in Settings changes the flavor of Honza's next unprompted message.

### Phase 6: Onboarding flow
**Outcome:** First-time users are set up before they ever see the bare home screen.
**Depends on:** Phase 1, Phase 5 (onboarding needs the same ingestion + preferences primitives, just presented as a first-run wizard).
**What gets built:** A gated first-run flow (checks `onboarding_completed` from Phase 1's user record): name, self-assessed Czech level, topic interest selection, optional Google Doc URL paste (skippable, addable later in Settings). On completion, sets the flag and routes to Home.
**Verification gate:**
- A brand new user is forced through onboarding before reaching Home; an existing user with `onboarding_completed = true` skips straight to Home.
- Skipping the Google Doc step doesn't break Phase 3's engine (null context handled gracefully, confirmed in Phase 3 but re-verified here in the full flow).
- Data entered in onboarding actually populates the same Settings fields from Phase 5 — no duplicate/disconnected data model.

### Phase 7: Home screen
**Outcome:** The actual hero screen — Honza present, initiating, not a dashboard.
**Depends on:** Phase 2, 3, 4, 6.
**What gets built:** Home screen with Honza (200px hero, per DESIGN.md) as the dominant visual element, his current state reflecting real data (e.g. `idle` normally, transitioning to reflect an unread/waiting message), entry points into Chat and Call. This is where "Honza initiates contact" becomes visible: on load, check whether Honza has an unprompted opening message ready (generated via Phase 3's engine using the user's context and how long it's been since last contact) — if not generated yet for this session, generate and surface it here rather than making the user open Chat to a blank thread.
**Verification gate:**
- Loading Home as a returning user (with prior chat history) shows Honza with real state, not a static placeholder.
- A fresh unprompted opening line is visible/available without the user having to type first — this is the app's core differentiator and must actually work, not just be described.
- Navigation to Chat and Call both work and preserve the same Honza state/context.

### Phase 8: Voice call (STT/TTS)
**Outcome:** A real spoken conversation with Honza, browser-based.
**Depends on:** Phase 3 (engine), Phase 2 (state), Phase 4 (conversation persistence pattern reused).
**What gets built:** Call screen UI (distinct from chat — framed as a live call, not a text thread) using the Web Speech API (or an equivalent browser STT library) for speech-to-text on the user's spoken Czech, and a TTS provider for Honza's spoken replies. Use a cheap/solid TTS option (ElevenLabs is a reasonable default given cost-consciousness — note in code comments how to swap providers) routed server-side so no TTS API key is ever exposed client-side. Call transcript logged to the same conversation history as chat (Phase 4) so it's part of one continuous record, tagged by type (`chat` vs `call`).
**Verification gate:**
- Starting a call activates the mic, transcribes real spoken Czech accurately enough to send to the engine.
- Honza's replies are actually spoken aloud via TTS, not just displayed as text.
- Ending a call saves the exchange into the same persisted history Phase 4 built, visible afterward in Chat as a labeled call transcript.
- No STT/TTS provider keys appear in any client-side bundle or network request visible in browser devtools.

### Phase 9: Marketing/landing page + polish pass
**Outcome:** A stranger's first five seconds and a coherent PWA install experience.
**Depends on:** all prior phases (this is the front door and final polish).
**What gets built:** Unauthenticated landing page explaining Honza in one screen, leading to magic-link sign-up (Phase 1). PWA manifest/install prompt confirmed working (per existing next-pwa setup). Full pass across all screens confirming DESIGN.md compliance (cream base, Share Tech Mono, mood-reactive system) with no leftover dark-mode or placeholder styling from earlier iterations.
**Verification gate:**
- Landing page renders correctly logged-out, with a working path into magic-link auth.
- App is installable as a PWA on a mobile device/browser that supports it.
- Every screen from Phase 1 through 8 is visually consistent with DESIGN.md — spot-check each one.
- Full click-through of the definition-of-done story in section 2, start to finish, with no dead ends.

## 5. Data doctrine

- **No hardcoded data in components, ever.** All chat messages, Honza states, user preferences, and Google Doc content flow through the database and the real service functions built in the phases above — not inline arrays or placeholder strings in components.
- **No fictional data universe needed here** — this is a single-user-context app (each real user's own data), not a multi-entity demo dataset. The "data" that must be coherent is each authenticated user's own history and context, which is inherently coherent because it's real.
- **Seed/reset mechanism:** include a simple authenticated-user action (e.g. a "reset my data" option in Settings, or a documented admin script) that clears a test user's chat history and re-triggers onboarding, so the full flow can be re-walked during development without creating new email addresses every time.

## 6. Integration doctrine (seams)

This is a **real build**, not a demo — all integrations must be genuinely functional, not simulated, per the instructions below:

- **Magic link auth:** real, via a real email provider (transactional email service compatible with the auth library chosen in Phase 1). No fake "click to skip login" shortcuts in the shipped app; a dev-only bypass is acceptable but must be clearly gated behind an environment flag and never reachable in a production build.
- **LLM (OpenRouter):** real adapter, real API calls, server-side only. Model choice is configurable (not hardcoded string scattered across files) — store it in one config location so swapping models later is a one-line change.
- **Google Doc ingestion:** real fetch-and-parse of public Google Doc URLs, no OAuth (per existing decision). If a URL is private/inaccessible, fail visibly with a clear message — don't silently substitute fake content.
- **TTS (ElevenLabs or equivalent):** real, server-side proxied so keys never reach the client.
- **STT:** browser-native (Web Speech API) is acceptable and doesn't require a server key; if a different provider is used instead, it must follow the same server-side-key rule as TTS.
- **The one honest visible seam:** push notifications / true background "Honza texts you out of the blue while the app is closed" is the one place v1 cannot be fully real (no native push infrastructure in scope). Represent this honestly in the UI — e.g., Home screen shows "Honza has been thinking about you" with a real generated message waiting when you open the app, rather than pretending a phone notification fired. Do not fake a notification permission prompt that goes nowhere.
- **No secrets in code, ever.** All API keys (OpenRouter, TTS provider, email provider) live in environment variables only, consistent with the existing project decision, and are read only in server-side Route Handlers.

## 7. The doc map

- **DESIGN.md** protects "this looks like Honza, not a generic chat app." Open it before building or restyling any screen — especially Phase 2 (character component) and Phase 9 (final polish pass). If code in the repo contradicts it (e.g. leftover dark-mode styling), DESIGN.md wins.
- **CONTEXT.md** protects the product philosophy — ambient, not scheduled; a friend texting you, not a lesson app. Re-read it before Phase 4 (chat tone/correction UI) and Phase 7 (home screen initiation behavior) since these are the phases most likely to accidentally drift toward a generic chatbot or gamified app.
- **TASKS.md / MEMORY.md** — if these exist with prior progress notes, reconcile them with Phase 0's inventory rather than ignoring them; update them as you complete each phase below so they stay the live source of truth for future sessions, human or agent.

## 8. Operating block

Work through the phases in order, starting with Phase 0. Do not skip ahead to a visible feature before its primitive phase is verified done — that is a build error, not initiative. Do not stop between phases and do not ask me anything; every decision you need is in this document, and when something is genuinely ambiguous, resolve it toward the outcome narrative in section 1 (ambient, warm, friend-initiated, anti-Duolingo) and toward DESIGN.md for anything visual.

Do not report a phase complete until its verification gate passes for real, in the running app — not "should work," actually clicked through. If a verification gate fails, fix it before moving to the next phase; do not carry broken primitives forward.

No hardcoded data anywhere in components. No secrets in code. No fake external calls dressed up as real ones — if something genuinely cannot be made real in this build (see section 6's one honest seam), say so plainly in the UI rather than pretending.

Read CONTEXT.md and DESIGN.md before Phase 0 concludes, and re-check DESIGN.md every time you touch a screen's visual layer. Update TASKS.md and MEMORY.md as you complete each phase so there's a clean record of what's done.

Keep working until the definition of done in section 2 is true, end to end, in the actual running app.
