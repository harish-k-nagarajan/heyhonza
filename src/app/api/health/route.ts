import { NextResponse } from "next/server";

import { isEngineConfigured } from "@/lib/server/conversation-engine";
import { isTtsConfigured } from "@/lib/server/tts";

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
  });
}
