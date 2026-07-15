/**
 * Dev-only headless sign-in helper.
 *
 * Why this exists: Supabase's built-in email sender is capped at ~2 messages/hour,
 * which repeatedly blocked verification of the DB gates (re-login persistence,
 * returning-user routing, second-user isolation). The admin `generate_link`
 * endpoint mints the *same* one-time token and returns it directly without
 * sending mail, so it has no cap. The email was only ever a delivery mechanism.
 *
 * Usage:  node scripts/dev-signin.mjs <email> [next]
 *
 * Prints a localhost /auth/callback URL. Open it in the browser you want the
 * session in — the route calls verifyOtp server-side, so unlike the PKCE `code`
 * flow this works in any browser (no code verifier cookie required).
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local. That key bypasses RLS, so it
 * is read from the gitignored env file only, never shipped to the client, and
 * never imported by anything under src/.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const env = {};
  for (const file of [".env.local", ".env"]) {
    let raw;
    try {
      raw = readFileSync(join(root, file), "utf8");
    } catch {
      continue;
    }
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && env[m[1]] === undefined) {
        env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const email = process.argv[2];
const next = process.argv[3] || "/";

if (!email) {
  console.error("usage: node scripts/dev-signin.mjs <email> [next]");
  process.exit(1);
}
if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.\n" +
      "Find the service_role key in Supabase → Project Settings → API.",
  );
  process.exit(1);
}

const res = await fetch(`${url}/auth/v1/admin/generate_link`, {
  method: "POST",
  headers: {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ type: "magiclink", email }),
});

const body = await res.json();

if (!res.ok) {
  console.error(`generate_link failed (HTTP ${res.status}):`, body);
  process.exit(1);
}

// Shape moved between GoTrue versions: newer returns the token at the top
// level, older nests it under `properties`.
const hashed = body.hashed_token ?? body.properties?.hashed_token;
const type = body.verification_type ?? body.properties?.verification_type ?? "magiclink";

if (!hashed) {
  console.error("No hashed_token in response:", body);
  process.exit(1);
}

const callback = new URL("http://localhost:3000/auth/callback");
callback.searchParams.set("token_hash", hashed);
callback.searchParams.set("type", type);
callback.searchParams.set("next", next);

console.log(callback.toString());
