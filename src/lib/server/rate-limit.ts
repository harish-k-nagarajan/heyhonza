/**
 * Minimal in-memory fixed-window rate limiter. Best-effort abuse protection for
 * the chat route (MEMORY: "minimal protection if exposed publicly").
 *
 * Caveat: state is per-server-instance and resets on cold start, so on
 * serverless it's a soft guard, not a hard quota. Swap for a shared store
 * (Upstash/Redis) if we ever need real enforcement.
 */

type Window = { count: number; resetAt: number };

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;

const buckets = new Map<string, Window>();

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
};

export function rateLimit(
  key: string,
  max = MAX_PER_WINDOW,
  windowMs = WINDOW_MS,
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1, retryAfterSec: 0 };
  }

  if (existing.count >= max) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { ok: true, remaining: max - existing.count, retryAfterSec: 0 };
}

/** Best-effort client key from proxy headers (Vercel sets x-forwarded-for). */
export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
