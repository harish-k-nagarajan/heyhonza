import { NextResponse } from "next/server";

import {
  deleteUserProviderKey,
  saveUserProviderKey,
  validateElevenLabsKey,
  validateOpenRouterKey,
  type ProviderId,
} from "@/lib/server/provider-keys";
import { getUserId } from "@/lib/server/user-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseProvider(raw: unknown): ProviderId | null {
  if (raw === "openrouter" || raw === "elevenlabs") return raw;
  return null;
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json(
      { ok: false, reason: "Sign in to save a key." },
      { status: 401 },
    );
  }

  let body: { provider?: unknown; key?: unknown };
  try {
    body = (await req.json()) as { provider?: unknown; key?: unknown };
  } catch {
    return NextResponse.json({ ok: false, reason: "Invalid JSON." }, { status: 400 });
  }

  const provider = parseProvider(body.provider);
  const key = typeof body.key === "string" ? body.key.trim() : "";
  if (!provider || !key) {
    return NextResponse.json({ ok: false, reason: "Missing provider or key." }, { status: 400 });
  }

  const valid =
    provider === "openrouter"
      ? await validateOpenRouterKey(key)
      : await validateElevenLabsKey(key);
  if (!valid) {
    return NextResponse.json(
      { ok: false, reason: "That key was rejected. Check it and try again." },
      { status: 400 },
    );
  }

  const saved = await saveUserProviderKey(provider, key);
  if (!saved) {
    return NextResponse.json({ ok: false, reason: "Could not save the key." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, source: "user" });
}

export async function DELETE(req: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json(
      { ok: false, reason: "Sign in to disconnect." },
      { status: 401 },
    );
  }

  let body: { provider?: unknown };
  try {
    body = (await req.json()) as { provider?: unknown };
  } catch {
    return NextResponse.json({ ok: false, reason: "Invalid JSON." }, { status: 400 });
  }

  const provider = parseProvider(body.provider);
  if (!provider) {
    return NextResponse.json({ ok: false, reason: "Missing provider." }, { status: 400 });
  }

  await deleteUserProviderKey(provider);
  return NextResponse.json({ ok: true });
}
