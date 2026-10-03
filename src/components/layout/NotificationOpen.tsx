"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { incomingFromUrl } from "@/lib/client/incoming-chat";
import { useChatStore } from "@/stores/useChatStore";

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
