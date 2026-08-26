"use client";

/**
 * Web Push for installed PWAs. next-pwa disables the service worker in
 * `next dev`, so subscribe will time out there on purpose.
 */

export type PushSupport = "unsupported" | "denied" | "prompt" | "granted";

export function pushSupport(): PushSupport {
  if (typeof window === "undefined") return "unsupported";
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return "prompt";
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function registrationOrTimeout(ms = 4000): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator)) {
    throw new Error("no-sw");
  }
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error("no-sw")), ms);
    }),
  ]);
}

export async function subscribeToPush(): Promise<{ ok: boolean; reason?: string }> {
  const support = pushSupport();
  if (support === "unsupported") {
    return {
      ok: false,
      reason:
        "Notifications need an installed PWA (Add to Home Screen on iPhone; Chrome on Android).",
    };
  }
  if (support === "denied") {
    return { ok: false, reason: "Notifications are blocked in your browser settings." };
  }

  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublic) {
    return {
      ok: false,
      reason:
        "Phone alerts need VAPID keys on the server. Daily check-ins still save; they just won’t ping this device yet.",
    };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { ok: false, reason: "Notification permission was not granted." };
  }

  let reg: ServiceWorkerRegistration;
  try {
    reg = await registrationOrTimeout();
  } catch {
    return {
      ok: false,
      reason:
        "No service worker yet. Install Honza to the home screen, or use a production build (not local dev).",
    };
  }

  const existing = await reg.pushManager.getSubscription();
  const sub =
    existing ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublic) as BufferSource,
    }));

  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sub.toJSON()),
  });
  const data = (await res.json()) as { ok?: boolean; reason?: string; persisted?: boolean };
  if (!res.ok) {
    return { ok: false, reason: data.reason ?? "Could not save subscription." };
  }
  return { ok: true, reason: data.persisted ? undefined : "Saved locally — sign in to sync." };
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  try {
    const reg = await registrationOrTimeout(2000);
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
    }
  } catch {
    // Dev / no SW — nothing to drop.
  }
}
