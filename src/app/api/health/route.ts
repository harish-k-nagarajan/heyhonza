import { NextResponse } from "next/server";

import { isEngineConfigured } from "@/lib/server/conversation-engine";
import { isVapidConfigured } from "@/lib/server/push-send";
import { isTtsConfigured } from "@/lib/server/tts";
import { isAdminConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const llmConfigured = isEngineConfigured();
  return NextResponse.json({
    ok: true,
    provider: "openrouter",
    llmConfigured,
    // Whether Honza can speak (Phase 8). Booleans only — never echo a key, and
    // not even the voice id, since this endpoint is public.
    ttsProvider: "elevenlabs",
    ttsConfigured: isTtsConfigured(),
    // Back-compat alias (older clients read openaiConfigured).
    openaiConfigured: llmConfigured,
    // Booleans only — never echo keys. Operators use this to see why
    // phone alerts would no-op (missing VAPID, cron secret, or service role).
    vapidConfigured: isVapidConfigured(),
    cronConfigured: Boolean(process.env.CRON_SECRET?.trim()),
    adminConfigured: isAdminConfigured(),
  });
}
