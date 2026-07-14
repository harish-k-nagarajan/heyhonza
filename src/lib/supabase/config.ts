/**
 * Central place for the (public-safe) Supabase connection values.
 *
 * URL + anon key are safe to expose to the browser — Row Level Security on the
 * database is what actually protects user data (see supabase/migrations).
 * The service-role key is server-only and never imported into client code.
 *
 * Scaffold-first: until Harish provisions a Supabase project and adds these to
 * `.env.local` / Vercel, `isSupabaseConfigured()` returns false and the app
 * runs with auth disabled (no redirects, sign-in shows a "not configured"
 * notice) instead of crashing. Phase 1's verification gate stays open until
 * real keys are present.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}
