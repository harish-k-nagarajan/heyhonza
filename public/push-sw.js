/* global self, clients */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

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
      data: { url: data.url || "/chat" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetPath = event.notification.data?.url || "/chat";
  const target = new URL(targetPath, self.location.origin).href;
  event.waitUntil(
    (async () => {
      const windows = await clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of windows) {
        try {
          const path = new URL(client.url).pathname;
          if (path === targetPath || (targetPath === "/chat" && path.startsWith("/chat"))) {
            if ("focus" in client) return client.focus();
          }
        } catch {
          // Ignore malformed client URLs.
        }
      }
      return clients.openWindow(target);
    })(),
  );
});
