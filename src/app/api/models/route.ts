import { NextResponse } from "next/server";

import { fetchOpenRouterCatalog } from "@/lib/server/openrouter-models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const models = await fetchOpenRouterCatalog();
  return NextResponse.json({ models });
}
