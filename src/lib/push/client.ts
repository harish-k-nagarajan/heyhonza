"use client";

/**
 * Web Push subscribe. Prefers an existing service worker (next-pwa's /sw.js
 * in production). If none is registered, falls back to /push-sw.js so Chrome
 * on HTTPS can still subscribe — including local production-like setups.
 * Does not wait on navigator.serviceWorker.ready (that hangs in next-dev).
 */

export type PushSupport = "unsupported" | "denied" | "prompt" | "granted";

export type PushFailureCode =
  | "unsupported"
  | "denied"
  | "ios-not-standalone"
  | "vapid-missing"
  | "permission-denied"
  | "no-sw"
  | "subscribe-failed"
  | "save-failed";

export function pushSupport(): PushSupport {
  if (typeof window === "undefined") return "unsupported";
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return "prompt";
}

export function isIosPushDevice(): boolean {
  if (typeof window === "undefined") return false;
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
  const decoded = urlBase64ToUint8Array(vapidPublic);
  const copy = new Uint8Array(decoded.length);
  copy.set(decoded);
  return copy;
}

function existingApplicationServerKey(sub: PushSubscription): ArrayBuffer | null {
  const key = sub.options.applicationServerKey;
  if (!key) return null;
  if (key instanceof ArrayBuffer) {
    const copy = new Uint8Array(key.byteLength);
    copy.set(new Uint8Array(key));
    return copy.buffer;
  }
  if (ArrayBuffer.isView(key)) {
    const view = key;
    const copy = new Uint8Array(view.byteLength);
    copy.set(new Uint8Array(view.buffer, view.byteOffset, view.byteLength));
    return copy.buffer;
  }
  return null;
}

function keysMatch(existing: ArrayBuffer | null, expected: Uint8Array): boolean {
  if (!existing) return false;
  const have = new Uint8Array(existing);
  if (have.length !== expected.length) return false;
  for (let i = 0; i < have.length; i++) {
    if (have[i] !== expected[i]) return false;
  }
  return true;
}

async function waitUntilActive(
  reg: ServiceWorkerRegistration,
): Promise<ServiceWorkerRegistration> {
  if (reg.active) return reg;
  const pending = reg.installing ?? reg.waiting;
  if (!pending) throw new Error("no-sw");
  await new Promise<void>((resolve, reject) => {
    const fail = window.setTimeout(() => reject(new Error("no-sw")), 8000);
    const onState = () => {
      if (pending.state === "activated") {
        window.clearTimeout(fail);
        resolve();
        return;
      }
      if (pending.state === "redundant") {
        window.clearTimeout(fail);
        reject(new Error("no-sw"));
      }
    };
    pending.addEventListener("statechange", onState);
    onState();
  });
  if (reg.active) return reg;
  throw new Error("no-sw");
}

async function resolvePushRegistration(): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator)) {
    throw new Error("no-sw");
  }
  const existing = await navigator.serviceWorker.getRegistration();
  if (existing) return waitUntilActive(existing);
  try {
    const registered = await navigator.serviceWorker.register("/push-sw.js", { scope: "/" });
    return await waitUntilActive(registered);
  } catch {
    throw new Error("no-sw");
  }
}

async function fetchVapidPublicKey(): Promise<string | null> {
  try {
    const res = await fetch("/api/push/vapid", { cache: "no-store" });
    const data = (await res.json()) as { publicKey?: string | null };
    if (typeof data.publicKey === "string" && data.publicKey.trim()) {
      return data.publicKey.trim();
    }
  } catch {
    // Fall through to the build-time public key if the route is unreachable.
  }
  const baked = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  return baked || null;
}

export async function subscribeToPush(): Promise<{ ok: boolean; reason?: string }> {
  const support = pushSupport();
  if (support === "unsupported") {
    return { ok: false, reason: "unsupported" };
  }
  if (support === "denied") {
    return { ok: false, reason: "denied" };
  }
  // iOS Safari only exposes Web Push from a home-screen PWA. Android Chrome
  // can subscribe from a regular HTTPS tab.
  if (isIosPushDevice() && !isStandaloneDisplay()) {
    return { ok: false, reason: "ios-not-standalone" };
  }

  const vapidPublic = await fetchVapidPublicKey();
  if (!vapidPublic) {
    return { ok: false, reason: "vapid-missing" };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { ok: false, reason: "permission-denied" };
  }

  let reg: ServiceWorkerRegistration;
  try {
    reg = await resolvePushRegistration();
  } catch {
    return { ok: false, reason: "no-sw" };
  }

  const expectedKey = applicationServerKey(vapidPublic);
  let sub = await reg.pushManager.getSubscription();
  if (sub) {
    const currentKey = existingApplicationServerKey(sub);
    if (!keysMatch(currentKey, expectedKey)) {
      try {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
      } catch {
        // Best-effort server drop; still replace the browser subscription.
      }
      await sub.unsubscribe();
      sub = null;
    }
  }

  if (!sub) {
    try {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: expectedKey as BufferSource,
      });
    } catch (e) {
      return {
        ok: false,
        reason: e instanceof Error && e.message ? e.message : "subscribe-failed",
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
    return { ok: false, reason: data.reason ?? "save-failed" };
  }
  return { ok: true, reason: data.persisted ? undefined : "Saved locally — sign in to sync." };
}

export async function sendTestPush(): Promise<{ ok: boolean; reason?: string }> {
  const subscribed = await subscribeToPush();
  if (!subscribed.ok) {
    return subscribed;
  }
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
    const existing = await navigator.serviceWorker.getRegistration();
    if (!existing) return;
    const sub = await existing.pushManager.getSubscription();
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
