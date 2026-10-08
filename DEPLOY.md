# Honza — deploy & production verification (`DEPLOY.md`)

Deploy runbook. Everything here that needs a secret or an external account is a
step you do yourself. Do not commit keys. Secrets live only in Vercel env vars
and, for local dev, in `.env.local` (gitignored).

---

## 1. Environment variables

Set these in **Vercel → Project → Settings → Environment Variables** (Production +
Preview). Names only are documented in [`.env.example`](.env.example).

| Var | Scope | Required | Notes |
|-----|-------|----------|-------|
| `OPENROUTER_API_KEY` | **Server only** | ✅ | Gateway key from <https://openrouter.ai/keys>. Never `NEXT_PUBLIC_`. Read only by `src/lib/server/conversation-engine.ts`. |
| `HONZA_DEFAULT_MODEL` | Server | optional | OpenRouter model slug. Default `openai/gpt-4o-mini`. Must be in the allowlist in `src/lib/constants.ts`. |
| `NEXT_PUBLIC_SITE_URL` | Public | recommended | Public URL of the deployment you run. Used for OpenRouter attribution headers and `metadataBase`. |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | ✅ (for auth) | Supabase project URL. When this + the anon key are unset, middleware runs **pass-through** (no auth gate). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | ✅ (for auth) | Supabase anon/publishable key. Public-safe (RLS protects data). |
| `ELEVENLABS_API_KEY` | **Server only** | ✅ (for voice) | Honza's voice (Phase 8). From elevenlabs.io → Profile → API Keys. Never `NEXT_PUBLIC_`. Read only by `src/lib/server/tts.ts`; the browser only ever receives audio bytes from `/api/tts`. Without it `/call` still loads but Honza is mute and `/api/health` reports `ttsConfigured:false`. |
| `ELEVENLABS_VOICE_ID` | Server | optional | Defaults to a free-tier-safe premade voice. **Free tier can't use library voices via the API** — see §5's accent note. |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Public | ✅ (for phone alerts) | Public half of `npx web-push generate-vapid-keys`. Must be present **at build time** so the client bundle can subscribe. |
| `VAPID_PRIVATE_KEY` | **Server only** | ✅ (for phone alerts) | Private half of the same pair. Never `NEXT_PUBLIC_`. |
| `VAPID_SUBJECT` | Server | recommended | `mailto:` or `https:` contact. Default `mailto:honza@localhost`. |
| `CRON_SECRET` | **Server only** | ✅ (for check-ins) | Bearer token for `GET`/`POST /api/cron/check-ins`. Vercel Cron sends it automatically when the var is named `CRON_SECRET`. Also set it as a GitHub Actions secret so the 15-minute workflow can tick (Hobby Vercel cron is once a day and misses most slots). |
| `SECRETS_ENCRYPTION_KEY` | **Server only** | ✅ (for BYOK keys) | Encrypts per-user provider keys at rest. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** | ✅ (for check-ins) | Used by `/api/cron/check-ins` to write messages for every scheduled learner (RLS would hide other users' rows). Also used locally by `scripts/dev-signin.mjs`. **Never `NEXT_PUBLIC_`.** |

> Note the voice key **is** in the table above as of 2026-07-15 (Phase 8 shipped), but
> `ELEVENLABS_API_KEY` is **server-only** — never `NEXT_PUBLIC_`. Verified: it appears
> in no client bundle file and in no browser network request.

> **Pass-through vs configured:** with the two `NEXT_PUBLIC_SUPABASE_*` unset, every
> screen renders without login (dev convenience — this was the Phase-2 blocker fix).
> In production you want them **set** so `/`, `/onboarding`, `/chat`, `/settings`
> are gated behind sign-in.

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
   `supabase/migrations/0001_profiles.sql`, then
   `supabase/migrations/0002_conversations_and_context.sql` (this one creates
   `messages` — including the `kind` column that tags `chat` vs `call` turns — and
   `user_context`, with own-row RLS on each).
6. Set up **custom SMTP — see §4. This is a launch blocker**, not an optional polish
   step: without it the built-in sender caps at ~2 emails/hour and real learners
   cannot sign up.
7. Deploy.

`vercel.json` registers a once-daily Hobby cron at `0 8 * * *` UTC. That is a
backup only — see §6. `next-pwa` emits `public/sw.js` + `public/workbox-*.js`
during `next build`.

---

## 3. Production verification checklist

Run against the **deployed URL** (the sandbox can reach openrouter.ai, but the live
green-check belongs on prod with the real key in place).

- [ ] `npm run build` is green (also runs in CI on Vercel).
- [ ] `GET /api/health` → `{ ok: true, llmConfigured: true, vapidConfigured: true, cronConfigured: true, adminConfigured: true }`.
- [ ] **Push:** install the PWA, turn Daily check-ins on, tap **Send a test alert**. A Honza notification appears. Check-ins also land in Chat after the GitHub Action ticks.
- [ ] **Chat round-trip:** open `/chat`, send a Czech message, Honza replies in Czech
      with a correction/continuation. (This is the Phase-3 "live end-to-end" item.)
- [ ] **Google-Doc route:** in `/onboarding` or `/settings`, import a public Google
      Doc URL (Share → Anyone with the link → Viewer); text is fetched server-side.
- [ ] **Install:** on Android Chrome the install prompt appears (after ~4s, once);
      "Not now" suppresses it for 14 days; installing hides it and it doesn't return.
- [ ] **iOS Safari:** the "Add to Home Screen" hint shows (no `beforeinstallprompt` on iOS).
      Test on a **public or custom domain**, or a Vercel **Deployment Protection bypass
      URL** — `*.vercel.app` preview URLs return **403** when Deployment Protection is
      on, so Safari can't load the app to add it. Do **not** disable protection in code.
- [ ] **iOS Chrome / Firefox / Edge / Opera:** these browsers never fire
      `beforeinstallprompt` and cannot install a PWA from the in-app browser. The app
      shows a card telling the user to **open the site in Safari**, then Share → Add to
      Home Screen. Do not expect an install button in Chrome on iPhone.
- [ ] **Icons:** installed app shows the dot-matrix Honza face; maskable icon isn't
      cropped on Android adaptive-icon shapes.
- [ ] **Service worker:** registers at scope `/`; a new deploy activates without a
      manual hard-refresh (`skipWaiting` + `clientsClaim`).
- [ ] **Auth gate (if Supabase configured):** signed-out `/` → `/welcome` and
      signed-out `/chat` → `/signin`; **email+password sign-up → confirmation email
      arrives → the link authenticates**; refresh persists the session; sign-out
      returns to `/welcome`. (Auth moved from magic-link to email+password with
      confirmation on 2026-07-15.) The confirmation-email half of this check is
      **only meaningful once custom SMTP (§4) is live** — on the built-in sender you
      will hit the ~2/hour cap almost immediately.
- [ ] **RLS isolation:** sign in as two different users; neither sees the other's
      chat history or Google-Doc context.

> **Local testing does not need email at all.** `node scripts/dev-signin.mjs <email>`
> prints a redeemable `/auth/callback` URL, sends no mail, and is not rate-limited.
> Reach for that, not SMTP, when you just need a session. SMTP is a *launch* blocker,
> not a *testing* blocker — conflating the two has already cost one session.

---

## 4. Custom SMTP — production email (**LAUNCH BLOCKER**)

Supabase's built-in email sender is explicitly **not for production**: it caps at
roughly **2 emails per hour** and offers no deliverability guarantees. Since sign-up
requires a confirmation email, real learners simply cannot register until a custom
SMTP provider is attached. These steps need your own accounts and a domain you
control.

Resend's free tier (3,000 emails/month, 100/day) is more than enough for launch.

### 4.1 Resend — create the account and verify a domain

1. Sign up at <https://resend.com> (free tier, no card).
2. **Domains → Add Domain** → enter a domain you control.
   *No domain yet?* You can test with Resend's `onboarding@resend.dev` sender, but it
   **only delivers to your own Resend account address** — fine for a smoke test,
   useless for real learners. A real domain is required for launch.
3. Resend shows DNS records — typically an **MX** + **TXT (SPF)** pair and a
   **TXT (DKIM)** record. Add each one at your DNS host (Namecheap / Cloudflare /
   wherever the domain lives), copying values **exactly**.
4. Back in Resend, click **Verify DNS Records**. Propagation is usually minutes; it
   can take up to ~24h. Wait for **Verified** before continuing.
5. **API Keys → Create API Key** → name it `honza-supabase-smtp`, permission
   **Sending access**. Copy the `re_…` value **now** — it is shown exactly once.
   This string is your SMTP *password*.

### 4.2 Supabase — attach it

6. Open your project → **Authentication → Emails → SMTP Settings**.
7. Toggle **Enable Custom SMTP** on, and fill in:

   | Field | Value |
   |---|---|
   | Host | `smtp.resend.com` |
   | Port | `465` (implicit TLS; `587` for STARTTLS if 465 is blocked) |
   | Username | `resend` (the literal word — not your email) |
   | Password | the `re_…` API key from step 5 |
   | Sender email | `honza@<your-verified-domain>` — **must** be on the domain verified in 4.1 |
   | Sender name | `Honza` |

8. **Save**.
9. Still under **Authentication**, open **Rate Limits** and raise **"Rate limit for
   sending emails"** above the built-in default (e.g. `100`/hour). Attaching SMTP does
   **not** raise this by itself — miss this step and you keep the throttle you just
   paid to escape.

### 4.3 Verify it actually works

10. In a fresh incognito window, sign up at `/welcome` with a **real inbox you own**
    that has never been used on this project.
11. Confirm: the email arrives within ~a minute, **From** is your domain (not
    `supabase.io`), and the link lands you authenticated in the app.
12. Repeat 3–4 sign-ups back to back. On the built-in sender the third would fail on
    the ~2/hour cap; if all of them land, the cap is genuinely gone.
13. Check **Resend → Emails** — the sends should be listed as `Delivered`.

> The `re_…` key is a secret: it lives in the Supabase dashboard only. Never commit
> it, never put it in `.env.local`, never expose it to the client.

---

## 5. Voice / the call screen — manual checklist

`/api/tts` returns real decodable audio, `kind:'call'` rows persist into the shared
history, and the ElevenLabs key stays on the server. A headless check cannot hold a
microphone or hear a speaker. Walk this list on a phone or laptop with the sound on.
It should take two minutes.

Use **Chrome, Edge or Safari** (Web Speech API needs one of them) with the sound on.

- [ ] Open `/call`. Honza's dot-matrix face fills the screen and the button reads
      **CALL HONZA**.
- [ ] Tap **CALL HONZA**. Within a couple of seconds Honza's opener appears as a
      caption **and you hear him say it out loud** in Czech. ← *the load-bearing one*
- [ ] The call timer starts counting, and the mic ring pulses when he stops speaking.
- [ ] Say something in Czech (e.g. *"Ahoj Honzo, mám se dobře."*). Your words appear
      in the caption under **// YOU** — that's STT working live.
- [ ] Honza replies **audibly**, gently correcting if you slipped, and ends with a
      question. His reply is 1–3 sentences — short enough to speak.
- [ ] Tap the red **✕**. Audio cuts immediately, the mic goes cold, and you land in
      **Chat** with the whole exchange inside a `// CALL TRANSCRIPT` block.
- [ ] Open devtools → Network during a call: requests go to **`/api/tts`** on your own
      origin and **never** to `api.elevenlabs.io`. No key appears anywhere.

If the mic never activates, it's almost always browser permissions rather than the
app — check the address-bar mic icon. If Honza is silent but his text still appears,
that's the deliberate degradation: the call keeps working as a readable call, and the
reason is in the server log.

> **Known limitation — Honza's accent.** ElevenLabs' **free tier cannot use library
> ("professional") voices via the API**; those return `402 paid_plan_required` even
> though the dashboard lists them. Every Czech-native voice is a library voice. So the
> configured `ELEVENLABS_VOICE_ID` currently 402s, and the server falls back to a
> premade voice that speaks Czech **with an English accent**, logging a warning. The
> loop is real either way, but for a product that teaches pronunciation this is worth
> fixing: upgrade to a paid plan and the configured Czech voice is used automatically,
> **with no code change**.

---

## 6. Daily check-ins + Web Push

Phone alerts only fire when **all** of these are true:

1. The learner is signed in, daily check-ins are on, and they allowed notifications **from an installed PWA** (iPhone: Add to Home Screen, then open that icon). `next dev` has no service worker — use production or `npm run build && npm start`.
2. `NEXT_PUBLIC_VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` are set, and the public key was present when that deployment was **built**.
3. `SUPABASE_SERVICE_ROLE_KEY` + `CRON_SECRET` are set on the server so `/api/cron/check-ins` can run.
4. Something actually hits that route near the learner's slot. Vercel Hobby only allows **one daily cron** (`0 8 * * *` UTC in `vercel.json`), which fires the next morning, not at the chosen time. The live ticker is a Supabase `pg_cron` job (`honza-check-ins`, every minute). It reads two Vault secrets: `honza_cron_secret` (same value as `CRON_SECRET`) and `honza_check_ins_url` (the full `/api/cron/check-ins` URL on your deployment). The job does nothing until both are set. A test alert does not use that job. It calls `/api/push/test` immediately. The GitHub Action in `.github/workflows/check-ins.yml` is only a backup. It needs repository secrets `CRON_SECRET` and `CHECK_INS_URL`.
5. `/api/health` reports `vapidConfigured`, `cronConfigured`, and `adminConfigured` all `true`. Settings → Daily check-ins → **Send a test alert** should ping the device immediately.

If the production host is `*.vercel.app` with **Deployment Protection / SSO** on, phones and GitHub Actions will see a Vercel login wall. Turn that off for production, or use a custom domain (this project’s protection setting excludes custom domains).

`GET /api/health` is public booleans only — it never echoes keys.

---

## 7. Regenerating icons

Icons are generated from the ceramic orb (idle / waiting face) — keep them in
sync if the shell, face, or palette changes:

```bash
node scripts/generate-icons.mjs   # writes public/icons/* and public/apple-touch-icon.png
```
