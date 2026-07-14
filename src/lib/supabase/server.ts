import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/**
 * Server-side Supabase client bound to the request's cookies. Use in Server
 * Components, Route Handlers, and Server Actions to read the authenticated
 * user and query the database as that user (RLS enforced).
 *
 * In a Server Component, cookie writes are not allowed — `setAll` throws and we
 * swallow it. Session refresh writes happen in middleware instead, which owns a
 * mutable response.
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component — safe to ignore; middleware refreshes.
        }
      },
    },
  });
}
