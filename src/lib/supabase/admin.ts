import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { SUPABASE_URL, isSupabaseConfigured } from "./config";

/**
 * Service-role client for jobs that are not a signed-in user (cron check-ins).
 * Never import this from client code. Requires `SUPABASE_SERVICE_ROLE_KEY`
 * on the server (Vercel env / .env.local).
 */
export function createSupabaseAdminClient(): SupabaseClient | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!isSupabaseConfigured() || !key) return null;
  return createClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isAdminConfigured(): boolean {
  return Boolean(
    isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}
