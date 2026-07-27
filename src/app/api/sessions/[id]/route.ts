import { NextResponse } from "next/server";

import { loadSessionMessages } from "@/lib/server/user-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Load transcript messages for one ended (or active) session. */
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const messages = await loadSessionMessages(id);
  if (messages === null) {
    return NextResponse.json({ persisted: false }, { status: 404 });
  }
  return NextResponse.json({ persisted: true, messages });
}
