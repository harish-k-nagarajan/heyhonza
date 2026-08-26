import { NextResponse } from "next/server";

import {
  envKey,
  readUserCiphertext,
  resolveProviderKey,
  type ProviderId,
} from "@/lib/server/provider-keys";
import { getUserId } from "@/lib/server/user-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type ProviderStatus = {
  source: "none" | "env" | "user";
  connected: boolean;
};

export async function GET() {
  const userId = await getUserId();
  const llm = await statusFor("openrouter", userId);
  const tts = await statusFor("elevenlabs", userId);
  return NextResponse.json({ llm, tts, signedIn: Boolean(userId) });
}

async function statusFor(
  provider: ProviderId,
  userId: string | null,
): Promise<ProviderStatus> {
  if (userId) {
    const resolved = await resolveProviderKey(provider);
    return {
      source: resolved.source,
      connected: Boolean(resolved.key),
    };
  }
  const fromEnv = envKey(provider);
  const boxed = await readUserCiphertext(provider);
  if (boxed) return { source: "user", connected: true };
  if (fromEnv) return { source: "env", connected: true };
  return { source: "none", connected: false };
}
