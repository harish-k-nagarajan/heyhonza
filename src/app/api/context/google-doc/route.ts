import { NextResponse } from "next/server";

import { isLikelyGoogleDocUrl } from "@/lib/validators";
import { fetchPublicGoogleDocAsText } from "@/lib/server/google-doc";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (!url || !isLikelyGoogleDocUrl(url)) {
    return NextResponse.json(
      { error: "Enter a valid public Google Doc URL." },
      { status: 400 },
    );
  }

  const result = await fetchPublicGoogleDocAsText(url);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  return NextResponse.json({ text: result.text });
}
