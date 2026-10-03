import { NextResponse } from "next/server";

import { getUserId, resumeReplySession } from "@/lib/server/user-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SESSION_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Open the chat a notification named, or the newest unanswered check-in.
 * Other open chats end so only this one is live.
 */
export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ persisted: false }, { status: 401 });

  let body: { sessionId?: unknown; checkin?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  if (sessionId && !SESSION_ID.test(sessionId)) {
    return NextResponse.json({ error: "Invalid session." }, { status: 400 });
  }

  const resumed = await resumeReplySession({
    sessionId: sessionId || null,
    checkin: body.checkin === true,
  });
  if (!resumed) return NextResponse.json({ persisted: true, sessionId: null, messages: [] });
  return NextResponse.json({ persisted: true, ...resumed });
}
