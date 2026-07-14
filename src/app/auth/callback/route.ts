import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { ROUTES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const runtime = "nodejs";

/**
 * Magic-link landing. Supabase sends the learner here after they click the
 * email link. We exchange the one-time code (PKCE) or token hash for a real
 * session cookie, then send them into the app.
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

  const supabase = createSupabaseServerClient();

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
