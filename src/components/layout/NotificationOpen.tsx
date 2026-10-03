"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useChatStore, type IncomingOpen } from "@/stores/useChatStore";

const SESSION_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function incomingFromUrl(url: URL): IncomingOpen | null {
  const sessionId = url.searchParams.get("session")?.trim() ?? "";
  if (SESSION_ID.test(sessionId)) return { kind: "session", sessionId };
  if (url.searchParams.get("checkin") === "1") return { kind: "checkin" };
  return null;
}

/**
 * A notification tap asks the open app to show the chat Honza already started.
 * Installed on iOS, focusing the app does not change the page by itself.
 */
export function NotificationOpen() {
  const router = useRouter();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; url?: string } | null;
      if (!data || data.type !== "honza:open" || typeof data.url !== "string") return;
      let next: URL;
      try {
        next = new URL(data.url, window.location.origin);
      } catch {
        return;
      }
      if (next.origin !== window.location.origin) return;
      const incoming = incomingFromUrl(next);
      if (incoming) useChatStore.getState().setIncomingOpen(incoming);
      const dest = `${next.pathname}${next.search}`;
      if (`${window.location.pathname}${window.location.search}` !== dest) {
        router.push(dest);
      }
    };

    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [router]);

  return null;
}
