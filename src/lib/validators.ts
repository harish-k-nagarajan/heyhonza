const GOOGLE_DOC_HOST = "docs.google.com";

export function isLikelyGoogleDocUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    return (
      u.hostname === GOOGLE_DOC_HOST &&
      /\/document\/d\/[a-zA-Z0-9_-]+/.test(u.pathname)
    );
  } catch {
    return false;
  }
}

export function isAllowedModelId(id: string, allowed: readonly string[]): boolean {
  return allowed.includes(id);
}
