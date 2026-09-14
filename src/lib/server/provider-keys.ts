import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { decryptSecret, encryptSecret } from "@/lib/server/secret-box";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getUserId } from "@/lib/server/user-data";

export type ProviderId = "openrouter" | "elevenlabs";

/** Strip paste noise without altering the key body (spaces inside keys are invalid). */
export function normalizeProviderKey(raw: string): string {
  return raw
    .trim()
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "");
}

export type ProviderSource = "none" | "env" | "user";

const ENV_KEYS: Record<ProviderId, () => string | undefined> = {
  openrouter: () => process.env.OPENROUTER_API_KEY?.trim() || undefined,
  elevenlabs: () => process.env.ELEVENLABS_API_KEY?.trim() || undefined,
};

export function envKey(provider: ProviderId): string | undefined {
  return ENV_KEYS[provider]();
}

export async function readUserCiphertext(
  provider: ProviderId,
  client?: SupabaseClient,
  userId?: string,
): Promise<string | null> {
  const uid = userId ?? (await getUserId());
  if (!uid || !isSupabaseConfigured()) return null;
  const supabase = client ?? (await createSupabaseServerClient());
  const { data } = await supabase
    .from("user_provider_keys")
    .select("ciphertext")
    .eq("user_id", uid)
    .eq("provider", provider)
    .maybeSingle();
  return (data?.ciphertext as string | undefined) ?? null;
}

export async function resolveProviderKey(
  provider: ProviderId,
  opts?: { client?: SupabaseClient; userId?: string },
): Promise<{ key: string | null; source: ProviderSource }> {
  const boxed = await readUserCiphertext(provider, opts?.client, opts?.userId);
  if (boxed) {
    try {
      const key = decryptSecret(boxed).trim();
      if (key) return { key, source: "user" };
    } catch {
      // Corrupt box — fall through to env.
    }
  }
  const fromEnv = envKey(provider);
  if (fromEnv) return { key: fromEnv, source: "env" };
  return { key: null, source: "none" };
}

export async function saveUserProviderKey(
  provider: ProviderId,
  plainKey: string,
): Promise<boolean> {
  const userId = await getUserId();
  if (!userId || !isSupabaseConfigured()) return false;
  const supabase = await createSupabaseServerClient();
  const ciphertext = encryptSecret(normalizeProviderKey(plainKey));
  const { error } = await supabase.from("user_provider_keys").upsert(
    {
      user_id: userId,
      provider,
      ciphertext,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,provider" },
  );
  return !error;
}

export async function deleteUserProviderKey(provider: ProviderId): Promise<boolean> {
  const userId = await getUserId();
  if (!userId || !isSupabaseConfigured()) return false;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("user_provider_keys")
    .delete()
    .eq("user_id", userId)
    .eq("provider", provider);
  return !error;
}

/** OpenRouter's public model list returns 200 even with bad keys — auth/key does not. */
export async function validateOpenRouterKey(apiKey: string): Promise<boolean> {
  const trimmed = normalizeProviderKey(apiKey);
  if (!trimmed) return false;
  try {
    const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
      headers: {
        Authorization: `Bearer ${trimmed}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * ElevenLabs keys are often scoped without "User" read — `/v1/user` then 401s even
 * when TTS works. Probe endpoints Honza actually needs (models / voices) first.
 */
export async function validateElevenLabsKey(apiKey: string): Promise<boolean> {
  const trimmed = normalizeProviderKey(apiKey);
  if (!trimmed) return false;

  const headers = { "xi-api-key": trimmed, Accept: "application/json" };
  const probes = [
    "https://api.elevenlabs.io/v1/models",
    "https://api.elevenlabs.io/v1/voices?page_size=1",
    "https://api.elevenlabs.io/v1/user",
  ];

  try {
    for (const url of probes) {
      const res = await fetch(url, { headers, cache: "no-store" });
      if (res.ok) return true;
    }
    return false;
  } catch {
    return false;
  }
}
