import { ROUTES } from "@/lib/constants";
import type { IncomingOpen } from "@/stores/useChatStore";

const SESSION_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Deep link a notification tap leaves on /chat. */
export function incomingFromUrl(url: URL): IncomingOpen | null {
  if (url.pathname !== ROUTES.chat) return null;
  const sessionId = url.searchParams.get("session")?.trim() ?? "";
  if (SESSION_ID.test(sessionId)) return { kind: "session", sessionId };
  if (url.searchParams.get("checkin") === "1") return { kind: "checkin" };
  return null;
}

export function incomingFromLocation(): IncomingOpen | null {
  if (typeof window === "undefined") return null;
  return incomingFromUrl(new URL(window.location.href));
}
