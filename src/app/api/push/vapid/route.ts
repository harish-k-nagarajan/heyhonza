import { NextResponse } from "next/server";

import { isVapidConfigured } from "@/lib/server/push-send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public VAPID key only — never the private key. */
export async function GET() {
  const configured = isVapidConfigured();
  const publicKey = configured
    ? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() || null
    : null;
  return NextResponse.json({
    configured,
    publicKey,
  });
}
