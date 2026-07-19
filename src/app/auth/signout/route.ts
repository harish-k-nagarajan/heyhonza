import { NextResponse } from "next/server";

import { ROUTES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const runtime = "nodejs";

/** Sign the current user out and return them to the welcome front door. */
export async function POST(request: Request) {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  const url = new URL(ROUTES.welcome, request.url);
  url.searchParams.set("signedOut", "1");
  return NextResponse.redirect(url, { status: 303 });
}
