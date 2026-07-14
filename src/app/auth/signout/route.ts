import { NextResponse } from "next/server";

import { ROUTES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const runtime = "nodejs";

/** Sign the current user out and return them to the sign-in screen. */
export async function POST(request: Request) {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL(ROUTES.signin, request.url), {
    status: 303,
  });
}
