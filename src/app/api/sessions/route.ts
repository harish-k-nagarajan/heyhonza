import { NextResponse } from "next/server";

import {
  createChatSession,
  endChatSession,
  listEndedSessions,
  loadSessionMessages,
} from "@/lib/server/user-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** List ended chat sessions for the signed-in user. */
export async function GET() {
  const userId = await import("@/lib/server/user-data").then((m) => m.getUserId());
  if (!userId) return NextResponse.json({ persisted: false, sessions: [] });
  const sessions = await listEndedSessions();
  return NextResponse.json({ persisted: true, sessions });
}

/** Start a new active chat session. */
export async function POST() {
  const sessionId = await createChatSession();
  if (!sessionId) return NextResponse.json({ persisted: false }, { status: 401 });
  return NextResponse.json({ persisted: true, sessionId });
}

/** End the active session (body: { sessionId, preview, messageCount }). */
export async function PATCH(req: Request) {
  let body: { sessionId?: string; preview?: string; messageCount?: number };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!body.sessionId) {
    return NextResponse.json({ error: "Missing sessionId." }, { status: 400 });
  }
  const ok = await endChatSession(
    body.sessionId,
    body.preview ?? "",
    body.messageCount ?? 0,
  );
  if (!ok) return NextResponse.json({ persisted: false }, { status: 401 });
  return NextResponse.json({ persisted: true });
}
