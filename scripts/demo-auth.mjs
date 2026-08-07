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

function supabaseAdminHeaders(serviceKey) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };
}

/** Ensure demo user exists and profile has onboarding complete (service role). */
export async function ensureDemoProfile(email = "demo@honza.app") {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  const headers = supabaseAdminHeaders(serviceKey);

  let listRes = await fetch(
    `${url}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
  );
  let users = (await listRes.json()).users ?? [];

  if (users.length === 0) {
    const createRes = await fetch(`${url}/auth/v1/admin/users`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, email_confirm: true }),
    });
    const created = await createRes.json();
    if (!createRes.ok) {
      throw new Error(`create user failed: ${JSON.stringify(created)}`);
    }
    users = [created];
  }

  const userId = users[0].id;
  const patchRes = await fetch(`${url}/rest/v1/profiles?id=eq.${userId}`, {
    method: "PATCH",
    headers: {
      ...headers,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      onboarding_completed: true,
      level: "A2",
      topics: ["daily", "food"],
      preferred_model: "openai/gpt-4o-mini",
    }),
  });
  if (!patchRes.ok) {
    const body = await patchRes.text();
    throw new Error(`profile patch failed (HTTP ${patchRes.status}): ${body}`);
  }

  return userId;
}

/**
 * Mint a dev sign-in callback URL (same flow as scripts/dev-signin.mjs).
 */
export async function getAuthCallbackUrl(email = "demo@honza.app", next = "/chat") {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }

  await ensureDemoProfile(email);

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
    throw new Error(`generate_link failed (HTTP ${res.status}): ${JSON.stringify(body)}`);
  }

  const hashed = body.hashed_token ?? body.properties?.hashed_token;
  const type = body.verification_type ?? body.properties?.verification_type ?? "magiclink";

  if (!hashed) {
    throw new Error(`No hashed_token in response: ${JSON.stringify(body)}`);
  }

  const callback = new URL("http://localhost:3000/auth/callback");
  callback.searchParams.set("token_hash", hashed);
  callback.searchParams.set("type", type);
  callback.searchParams.set("next", next);
  return callback.toString();
}

/** Seed local onboarding/settings state for demo routes. */
export async function seedDemoState(page) {
  await page.evaluate(() => {
    localStorage.setItem(
      "honza-settings",
      JSON.stringify({
        state: {
          onboardingComplete: true,
          level: "A2",
          model: "openai/gpt-4o-mini",
          topics: ["daily", "food"],
          contextChunks: [],
          lastSynced: 0,
        },
        version: 0,
      }),
    );
  });
}

/**
 * Sign in via dev magic link and seed demo state. Returns false when Supabase
 * isn't configured (caller can fall back to localStorage-only capture).
 */
export async function authenticateForDemo(page, { email = "demo@honza.app" } = {}) {
  const env = loadEnv();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return false;
  }

  const callbackUrl = await getAuthCallbackUrl(email, "/chat");
  await page.goto(callbackUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await seedDemoState(page);
  return true;
}
