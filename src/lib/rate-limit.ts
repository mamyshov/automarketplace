import "server-only";

/**
 * Minimal in-memory rate limiter for public lead-capture forms (spec §9:
 * "защита от накрутки просмотров/лидов"). Good enough for a single-instance
 * MVP deployment; each serverless instance has its own memory so this is not
 * a hard guarantee on Vercel with multiple instances — swap for a shared
 * store (Upstash Redis, or a Postgres table) before relying on it in
 * production at scale.
 */
const hits = new Map<string, number[]>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    hits.set(key, timestamps);
    return false;
  }

  timestamps.push(now);
  hits.set(key, timestamps);
  return true;
}

export function clientIpFrom(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
