# Honza — deploy & production verification (`DEPLOY.md`)

Phase 4 runbook. Everything here that needs a secret or an external account is a
**human step** (Harish) — Claude never sees or commits keys. Secrets live only in
Vercel env vars and, for local dev, in `.env.local` (gitignored).

---

## 1. Environment variables

Set these in **Vercel → Project → Settings → Environment Variables** (Production +
Preview). Names only are documented in [`.env.example`](.env.example).

| Var | Scope | Required | Notes |
|-----|-------|----------|-------|
| `OPENROUTER_API_KEY` | **Server only** | ✅ | Gateway key from <https://openrouter.ai/keys>. Never `NEXT_PUBLIC_`. Read only by `src/lib/server/conversation-engine.ts`. |
| `HONZA_DEFAULT_MODEL` | Server | optional | OpenRouter model slug. Default `openai/gpt-4o-mini`. Must be in the allowlist in `src/lib/constants.ts`. |
| `NEXT_PUBLIC_SITE_URL` | Public | recommended | Canonical prod URL (e.g. `https://heyhonza.vercel.app`). Used for OpenRouter attribution headers + `metadataBase`. |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | ✅ (for auth) | Supabase project URL. When this + the anon key are unset, middleware runs **pass-through** (no auth gate). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | ✅ (for auth) | Supabase anon/publishable key. Public-safe (RLS protects data). |

> **Pass-through vs configured:** with the two `NEXT_PUBLIC_SUPABASE_*` unset, every
> screen renders without login (dev convenience — this was the Phase-2 blocker fix).
> In production you want them **set** so `/`, `/onboarding`, `/chat`, `/settings`
> are gated behind email+password sign-in (with email confirmation).

> **⚠️ `SUPABASE_SERVICE_ROLE_KEY` is deliberately NOT in the table above — do not add it
> to Vercel.** It is documented in `.env.example` by name only and is **local-dev-only**:
> it powers `scripts/dev-signin.mjs`, which mints a headless sign-in token via the admin
> API. The service-role key **bypasses Row Level Security entirely**, so exposing it in a
> deployed environment would defeat the per-user data isolation the whole DB layer relies
> on. Nothing under `src/` imports it, so the deployed app never needs it. Keep it only in
> your gitignored local `.env.local`.

### Local dev

```bash
cp .env.example .env.local   # then fill values (or leave SUPABASE blank for pass-through)
npm run dev                  # PWA/service worker disabled in dev by next-pwa
```

---

## 2. Vercel project setup (human)

1. Import `harish-k-nagarajan/heyhonza` into Vercel (Framework preset: **Next.js**, zero-config).
2. Set **Production Branch** to `main` (Settings → Git).
3. Add the env vars from §1 to **Production** and **Preview**.
4. In **Supabase → Authentication → URL Configuration**, add the redirect URL
   `https://<your-domain>/auth/callback` (and the Vercel preview domain if you use previews).
5. Ensure **both** migrations have been run on the Supabase project, in order:
   `supabase/migrations/0001_profiles.sql` (profiles + RLS + signup trigger) and
   `0002_conversations_and_context.sql` (`messages` + `user_context` + settings columns).
6. Set up **custom SMTP** (§4) so real users can actually receive the confirmation email —
   the built-in sender caps at ~2/hour and is not for production.
7. Deploy.

No `vercel.json` is required — Next.js is zero-config on Vercel, and `next-pwa`
emits `public/sw.js` + `public/workbox-*.js` during `next build`.

---

## 3. Production verification checklist

Run against the **deployed URL** (the sandbox can reach openrouter.ai, but the live
green-check belongs on prod with the real key in place).

- [ ] `npm run build` is green (also runs in CI on Vercel).
- [ ] `GET /api/health` → `{ ok: true, provider: "openrouter", llmConfigured: true }`.
- [ ] **Chat round-trip:** open `/chat`, send a Czech message, Honza replies in Czech
      with a correction/continuation. (This is the Phase-3 "live end-to-end" item.)
- [ ] **Google-Doc route:** in `/onboarding` or `/settings`, import a public Google
      Doc URL (Share → Anyone with the link → Viewer); text is fetched server-side.
- [ ] **Install:** on Android Chrome the install prompt appears (after ~4s, once);
      "Not now" suppresses it for 14 days; installing hides it and it doesn't return.
- [ ] **iOS Safari:** the "Add to Home Screen" hint shows (no `beforeinstallprompt` on iOS).
- [ ] **Icons:** installed app shows the dot-matrix Honza face; maskable icon isn't
      cropped on Android adaptive-icon shapes.
- [ ] **Service worker:** registers at scope `/`; a new deploy activates without a
      manual hard-refresh (`skipWaiting` + `clientsClaim`).
- [ ] **Auth gate (if Supabase configured):** unauthenticated `/chat` → `/signin`;
      email+password sign-in (after confirming via the emailed link) → authed; refresh
      persists; sign-out returns to `/signin`.
- [ ] **Confirmation email delivers via custom SMTP (§4):** a fresh sign-up receives the
      confirmation email within seconds (not throttled by the built-in ~2/hour cap).

---

## 4. Custom SMTP — production email (LAUNCH BLOCKER)

Supabase's **built-in email sender caps at ~2 messages/hour**, can't be raised, locks
template editing, and Supabase explicitly says it is **not for production**. Until custom
SMTP is configured, real learners **cannot sign up** — the confirmation email that
email+password auth depends on simply won't arrive for most of them. This is a genuine
launch blocker, not a nice-to-have. (It is *not* a testing blocker — `scripts/dev-signin.mjs`
sends no email at all; see §"Local dev".)

Below is a click-by-click setup using **Resend** (has a free tier). Any SMTP provider works;
Resend is just the least-friction one.

### 4a. Resend — get SMTP credentials

1. Sign up at <https://resend.com> and log in.
2. **Verify a sending domain** (required to email anyone but yourself):
   - Left sidebar → **Domains** → **Add Domain**.
   - Enter a domain you control (e.g. `heyhonza.com`, or a subdomain like `mail.heyhonza.com`).
   - Resend shows a set of **DNS records** (an `MX` record and `TXT` records for SPF + DKIM,
     plus an optional DMARC `TXT`). Add each one at your DNS provider (Cloudflare, Namecheap,
     Vercel Domains, etc.) exactly as shown.
   - Back in Resend, click **Verify DNS Records** and wait until the domain shows
     **Verified** (usually minutes; can take up to a few hours for DNS to propagate).
   - *Shortcut for a smoke test only:* Resend's shared `onboarding@resend.dev` sender needs
     no domain, but it can **only email your own Resend account address** — useless for real
     signups, so verify a real domain before launch.
3. **Create an API key:**
   - Left sidebar → **API Keys** → **Create API Key**.
   - Name it (e.g. `honza-supabase-smtp`), permission **Sending access**, then **Add**.
   - **Copy the key now** (starts with `re_…`) — Resend shows it only once. This key **is**
     your SMTP password.
4. Resend's SMTP settings (same for every account) are:
   - **Host:** `smtp.resend.com`
   - **Port:** `465` (SSL) — or `587` (STARTTLS) if your setup prefers it
   - **Username:** `resend`
   - **Password:** the `re_…` API key from step 3

### 4b. Supabase — point auth at Resend

1. Supabase Dashboard → your project → **Authentication** (left sidebar).
2. Open **Emails** → the **SMTP Settings** tab.
3. Toggle **Enable Custom SMTP** on.
4. Fill in the fields:
   - **Sender email:** an address **at your verified domain** (e.g. `honza@heyhonza.com`).
     It must match the domain you verified in Resend, or Resend will reject the send.
   - **Sender name:** `Honza` (what learners see in their inbox).
   - **Host:** `smtp.resend.com`
   - **Port number:** `465`
   - **Username:** `resend`
   - **Password:** the `re_…` API key.
5. **Save**.
6. (Recommended) **Authentication → Rate Limits** → raise **"Rate limit for sending emails"**
   above the built-in default now that a real provider is behind it.
7. **Verify:** trigger a real sign-up (or Authentication → Users → invite) and confirm the
   email lands within seconds. Check Resend's **Logs / Emails** tab to see the send and its
   delivery status. This is the DEPLOY §3 checklist item "Confirmation email delivers via
   custom SMTP".

> No secret from this section ever touches the repo or the Next.js app. The Resend API key
> lives **only** in Supabase's SMTP settings — Honza's own code never sends email.

---

## 5. Regenerating icons

Icons are generated from the idle `HonzaOrb` face — keep them in sync if the face
or palette changes:

```bash
node scripts/generate-icons.mjs   # writes public/icons/* and public/apple-touch-icon.png
```
