import { NextResponse } from "next/server";

import { clientKey, rateLimit } from "@/lib/server/rate-limit";
import { MAX_TTS_CHARS, TtsError, synthesizeSpeech } from "@/lib/server/tts";

export const runtime = "nodejs";

/**
 * Honza's voice. The browser POSTs text and gets **audio bytes** back — the
 * ElevenLabs key stays on the server and is never exposed to the client, and the
 * provider's hostname never appears in a devtools network entry (CLAUDE.md Hard
 * Rule 2). Provider swap lives in `lib/server/tts`, not here.
 */

type TtsRequestBody = { text?: unknown };

export async function POST(req: Request) {
  // Tighter than /api/chat's window: every call here burns TTS characters, and
  // the free tier's monthly budget is small enough to exhaust by accident.
  const limit = rateLimit(`tts:${clientKey(req)}`, 30);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Slow down a moment." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let body: TtsRequestBody;
  try {
    body = (await req.json()) as TtsRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body.text !== "string" || !body.text.trim()) {
    return NextResponse.json({ error: "Missing text." }, { status: 400 });
  }

  try {
    const { audio, contentType, voiceId } = await synthesizeSpeech(
      body.text.slice(0, MAX_TTS_CHARS),
    );
    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(audio.byteLength),
        // Honza's replies are one-shot and user-specific; never let a shared
        // cache hold onto someone's lesson audio.
        "Cache-Control": "no-store, private",
        // Debug aid only — a voice id is not a secret, unlike the key.
        "X-Honza-Voice": voiceId,
      },
    });
  } catch (e) {
    if (e instanceof TtsError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
