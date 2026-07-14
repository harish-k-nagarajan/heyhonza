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
> are gated behind the magic-link sign-in.

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
5. Ensure `supabase/migrations/0001_profiles.sql` has been run on the Supabase project.
6. Deploy.

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
      magic-link login → authed; refresh persists; sign-out returns to `/signin`.

---

## 4. Regenerating icons

Icons are generated from the idle `HonzaOrb` face — keep them in sync if the face
or palette changes:

```bash
node scripts/generate-icons.mjs   # writes public/icons/* and public/apple-touch-icon.png
```
