/* global self, clients */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

function notificationTarget(dataUrl) {
  let target;
  try {
    target = new URL(typeof dataUrl === "string" ? dataUrl : "/chat", self.location.origin);
  } catch {
    target = new URL("/chat", self.location.origin);
  }
  if (target.origin !== self.location.origin) {
    target = new URL("/chat", self.location.origin);
  }
  // Older alerts only stored /chat. That still means "open the message I can reply to".
  if (target.pathname === "/chat" && !target.searchParams.get("session")) {
    target.searchParams.set("checkin", "1");
  }
  return target.href;
}

self.addEventListener("push", (event) => {
  let data = { title: "Honza", body: "", url: "/chat" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // Keep defaults.
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Honza", {
      body: data.body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      // `silent` stays unset (false). The phone plays its default alert sound
      // unless the ringer switch, Focus, or this app's notification sound is off.
      data: { url: data.url || "/chat" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = notificationTarget(event.notification.data?.url);
  event.waitUntil(
    (async () => {
      const windows = await clients.matchAll({ type: "window", includeUncontrolled: true });
      const client = windows[0];
      if (client) {
        // iOS often focuses the already-open screen and ignores a new URL.
        // The page routes from this message; navigate() covers browsers that have it.
        client.postMessage({ type: "honza:open", url: target });
        if (typeof client.navigate === "function") {
          try {
            await client.navigate(target);
          } catch {
            // The message handler still opens the chat.
          }
        }
        if ("focus" in client) return client.focus();
      }
      return clients.openWindow(target);
    })(),
  );
});
