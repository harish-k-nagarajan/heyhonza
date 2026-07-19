import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { ROUTES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const runtime = "nodejs";

/**
 * Email-link landing. Supabase sends the learner here after they click the
 * confirmation link from sign-up; we exchange the one-time code (PKCE) or token
 * hash for a real session cookie, then send them into the app.
 *
 * Password sign-in never touches this route — it gets a session directly. This
 * also still serves magic links, which remain enabled at the Supabase project
 * level (unexposed in the UI) as a dev sign-in path; see BUILD_SPEC_STATUS.md.
 *
 * Note the PKCE branch only works in the browser that *started* the flow — the
 * code verifier lives in a cookie there. A link opened elsewhere consumes the
 * token and fails.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = url.searchParams.get("next") || ROUTES.home;

  const redirectTo = new URL(next, url.origin);

  if (!isSupabaseConfigured()) {
    redirectTo.pathname = ROUTES.signin;
    redirectTo.searchParams.set("error", "not_configured");
    return NextResponse.redirect(redirectTo);
  }

  const supabase = await createSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(redirectTo);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(redirectTo);
  }

  redirectTo.pathname = ROUTES.signin;
  redirectTo.search = "";
  redirectTo.searchParams.set("error", "link_invalid");
  return NextResponse.redirect(redirectTo);
}
