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

function isIosDevice(): boolean {
  const ua = window.navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  return window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1;
}

function isStandaloneDisplay(): boolean {
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return Boolean(nav.standalone);
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function applicationServerKey(vapidPublic: string): Uint8Array {
  // Copy into a standalone Uint8Array so Chrome does not see a view on a
  // larger buffer, and TypeScript does not widen `.buffer` to SharedArrayBuffer.
  return new Uint8Array(urlBase64ToUint8Array(vapidPublic));
}

async function registrationOrTimeout(ms = 10000): Promise<ServiceWorkerRegistration> {
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
  if (isIosDevice() && !isStandaloneDisplay()) {
    return {
      ok: false,
      reason:
        "On iPhone, add Honza to the Home Screen first, then open it from there and turn check-ins on.",
    };
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
        "No service worker yet. Install Honza to the home screen, or use a production build (not local next dev).",
    };
  }

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    try {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey(vapidPublic) as BufferSource,
      });
    } catch (e) {
      return {
        ok: false,
        reason:
          e instanceof Error
            ? e.message
            : "This browser refused the push subscription.",
      };
    }
  }

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

export async function sendTestPush(): Promise<{ ok: boolean; reason?: string }> {
  const res = await fetch("/api/push/test", { method: "POST" });
  const data = (await res.json()) as { ok?: boolean; reason?: string };
  if (!res.ok || !data.ok) {
    return { ok: false, reason: data.reason ?? "Could not send a test alert." };
  }
  return { ok: true };
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
