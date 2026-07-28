import { NextResponse } from "next/server";

import { getUserId } from "@/lib/server/user-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PushSubscriptionJson = {
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
};

/** Persist a Web Push subscription for the signed-in user (foundation). */
export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, persisted: false, reason: "Auth not configured." });
  }

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ ok: false, reason: "Sign in to save push subscription." }, { status: 401 });
  }

  let body: PushSubscriptionJson;
  try {
    body = (await req.json()) as PushSubscriptionJson;
  } catch {
    return NextResponse.json({ ok: false, reason: "Invalid JSON." }, { status: 400 });
  }

  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return NextResponse.json({ ok: false, reason: "Invalid subscription." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: userId,
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,endpoint" },
  );

  if (error) {
    return NextResponse.json({ ok: false, reason: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, persisted: true });
}

/** Remove a push subscription. */
export async function DELETE(req: Request) {
  const userId = await getUserId();
  if (!userId || !isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  let body: { endpoint?: string };
  try {
    body = (await req.json()) as { endpoint?: string };
  } catch {
    return NextResponse.json({ ok: false, reason: "Invalid JSON." }, { status: 400 });
  }

  if (!body.endpoint) {
    return NextResponse.json({ ok: false, reason: "Missing endpoint." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", userId)
    .eq("endpoint", body.endpoint);

  return NextResponse.json({ ok: true, persisted: true });
}
