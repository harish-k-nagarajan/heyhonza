import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { decryptSecret, encryptSecret } from "@/lib/server/secret-box";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getUserId } from "@/lib/server/user-data";

export type ProviderId = "openrouter" | "elevenlabs";

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
  const ciphertext = encryptSecret(plainKey.trim());
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

export async function validateOpenRouterKey(apiKey: string): Promise<boolean> {
  const res = await fetch("https://openrouter.ai/api/v1/models", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  return res.ok;
}

export async function validateElevenLabsKey(apiKey: string): Promise<boolean> {
  const res = await fetch("https://api.elevenlabs.io/v1/user", {
    headers: { "xi-api-key": apiKey, Accept: "application/json" },
    cache: "no-store",
  });
  return res.ok;
}
