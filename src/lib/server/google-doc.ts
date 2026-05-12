const DOC_ID_REGEX = /\/document\/d\/([a-zA-Z0-9_-]+)/;

export function extractGoogleDocId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname !== "docs.google.com") return null;
    const m = u.pathname.match(DOC_ID_REGEX);
    return m?.[1] ?? null;
  } catch {
    return null;
  }
}

const MAX_BYTES = 512_000;

export async function fetchPublicGoogleDocAsText(
  url: string,
): Promise<{ text: string } | { error: string }> {
  const id = extractGoogleDocId(url);
  if (!id) {
    return { error: "Invalid Google Doc URL." };
  }

  const exportUrl = `https://docs.google.com/document/d/${id}/export?format=txt`;
  const res = await fetch(exportUrl, {
    headers: {
      "User-Agent":
        "HonzaPWA/1.0 (public Google Doc export; +https://vercel.com)",
    },
    redirect: "follow",
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    return {
      error:
        "Could not download the document. Make sure the link is public (Anyone with the link — Viewer).",
    };
  }

  const buf = await res.arrayBuffer();
  if (buf.byteLength > MAX_BYTES) {
    return { error: "Document text is too long. Please shorten it." };
  }

  const text = new TextDecoder("utf-8", { fatal: false }).decode(buf);
  if (!text.trim()) {
    return { error: "Document is empty or not readable as plain text." };
  }

  return { text: text.trim() };
}
