/**
 * In-memory fixed-window rate limiter. Good enough for single-instance dev
 * and small deployments; state is process-local so it resets on restart and
 * does NOT coordinate across multiple server instances. Swap for a
 * Redis-backed limiter (INCR + EXPIRE) before running more than one
 * instance — the `check()` call site below doesn't need to change.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Prevent unbounded memory growth from garbage keys (e.g. spoofed IPs).
const MAX_BUCKETS = 50_000;

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    if (buckets.size >= MAX_BUCKETS) buckets.clear();
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (existing.count >= limit) return false;
  existing.count += 1;
  return true;
}

export class RateLimitedError extends Error {
  constructor(message = "Too many requests, please try again later") {
    super(message);
    this.name = "RateLimitedError";
  }
}
