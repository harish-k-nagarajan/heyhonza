"use client";

import { createBrowserClient } from "@supabase/ssr";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/**
 * Browser-side Supabase client. Only touches the public anon key. Used by the
 * sign-in form for email+password sign-in / sign-up and to read auth state in
 * the client.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
