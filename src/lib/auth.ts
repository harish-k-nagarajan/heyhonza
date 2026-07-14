import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type Profile = {
  id: string;
  email: string | null;
  name: string | null;
  onboarding_completed: boolean;
  created_at: string;
};

/**
 * The authenticated user for the current request, or null. Returns null when
 * Supabase isn't configured yet (scaffold-first) so pages can render a signed-
 * out state without throwing.
 */
export async function getCurrentUser() {
  if (!isSupabaseConfigured()) return null;
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * The current user's profile row. A DB trigger creates one row per auth user
 * (see supabase/migrations), so a signed-in user always has a profile.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, email, name, onboarding_completed, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return (data as Profile | null) ?? null;
}
