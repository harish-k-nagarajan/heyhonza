import { NextResponse } from "next/server";

import {
  EngineError,
  generateReply,
  sanitizeMessages,
} from "@/lib/server/conversation-engine";
import { clientKey, rateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

type ChatRequestBody = {
  model?: string;
  messages?: unknown;
  topics?: string[];
  learnerContext?: string;
  level?: string;
  bootstrap?: boolean;
};

export async function POST(req: Request) {
  // Best-effort abuse protection before we do any work.
  const limit = rateLimit(clientKey(req));
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Slow down a moment." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const messages = sanitizeMessages(body.messages, Boolean(body.bootstrap));
  if (!messages) {
    return NextResponse.json(
      { error: "Missing messages or bootstrap." },
      { status: 400 },
    );
  }

  try {
    const { text, model } = await generateReply({
      requestedModel: body.model,
      topics: Array.isArray(body.topics) ? body.topics : undefined,
      learnerContext:
        typeof body.learnerContext === "string" ? body.learnerContext : "",
      level: typeof body.level === "string" ? body.level : undefined,
      messages,
    });
    return NextResponse.json({ message: text, model });
  } catch (e) {
    if (e instanceof EngineError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
