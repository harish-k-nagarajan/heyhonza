import { NextResponse } from "next/server";

import { isEngineConfigured } from "@/lib/server/conversation-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const llmConfigured = isEngineConfigured();
  return NextResponse.json({
    ok: true,
    provider: "openrouter",
    llmConfigured,
    // Back-compat alias (older clients read openaiConfigured).
    openaiConfigured: llmConfigured,
  });
}
