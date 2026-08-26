import { NextResponse } from "next/server";

import type { ContextSource } from "@/types";
import {
  addContextChunk,
  loadUserState,
  removeContextChunk,
  resetUserData,
  updateProfile,
  upsertContextByKind,
  type ProfilePatch,
} from "@/lib/server/user-data";

export const runtime = "nodejs";
// Per-user, cookie-dependent state — must never be statically cached.
export const dynamic = "force-dynamic";

/**
 * The per-user state seam. GET hydrates the whole signed-in user (profile,
 * context, chat history); PUT applies a small patch (profile fields, add/remove
 * a context chunk, or reset). When Supabase isn't configured or nobody's signed
 * in, both return `{ persisted: false }` and the client falls back to its local
 * Zustand/localStorage stores — so local dev works with no auth.
 */
export async function GET() {
  const state = await loadUserState();
  if (!state) return NextResponse.json({ persisted: false });
  return NextResponse.json(state);
}

type StatePatch = {
  profile?: ProfilePatch;
  addContext?: { text: string; meta: ContextSource };
  upsertContext?: { text: string; meta: ContextSource };
  removeContextId?: string;
  reset?: boolean;
};

export async function PUT(req: Request) {
  let body: StatePatch;
  try {
    body = (await req.json()) as StatePatch;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (body.reset) {
    const ok = await resetUserData();
    return NextResponse.json({ persisted: ok });
  }

  let persisted = false;
  const result: {
    persisted: boolean;
    added?: { id: string; syncedAt: number };
  } = { persisted: false };

  if (body.profile) {
    persisted = (await updateProfile(body.profile)) || persisted;
  }
  if (body.addContext && typeof body.addContext.text === "string") {
    const added = await addContextChunk(body.addContext.text, body.addContext.meta);
    if (added) {
      result.added = added;
      persisted = true;
    }
  }
  if (body.upsertContext && typeof body.upsertContext.text === "string") {
    const added = await upsertContextByKind(
      body.upsertContext.text,
      body.upsertContext.meta,
    );
    if (added) {
      result.added = added;
      persisted = true;
    }
  }
  if (body.removeContextId) {
    persisted = (await removeContextChunk(body.removeContextId)) || persisted;
  }

  result.persisted = persisted;
  return NextResponse.json(result);
}
