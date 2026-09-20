import { NextResponse } from "next/server";

import { getUserId } from "@/lib/server/user-data";
import { isVapidConfigured, sendPushToUser } from "@/lib/server/push-send";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Send a test Web Push to the signed-in user's saved devices. */
export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, reason: "Sign in is not configured on this server." },
      { status: 503 },
    );
  }

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ ok: false, reason: "Sign in to test alerts." }, { status: 401 });
  }

  if (!isVapidConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        reason:
          "Phone alerts need VAPID keys on the server. Generate a pair with npx web-push generate-vapid-keys.",
      },
      { status: 503 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const result = await sendPushToUser(supabase, userId, {
    title: "Honza",
    body: "Tohle je test. Jsem tady, až budeš chtít procvičit češtinu.",
    url: "/chat",
  });

  if (result.attempted === 0) {
    return NextResponse.json({
      ok: false,
      reason:
        "No device is subscribed yet. Turn daily check-ins on from an installed PWA (not local next dev).",
    });
  }

  if (result.sent === 0) {
    return NextResponse.json({
      ok: false,
      reason:
        result.gone > 0
          ? "That subscription expired. Turn check-ins off and on again from this device."
          : "The push service rejected the send. Check VAPID keys match the ones used to subscribe.",
    });
  }

  return NextResponse.json({ ok: true, ...result });
}
