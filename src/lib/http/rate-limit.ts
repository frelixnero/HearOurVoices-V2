// Minimal fixed-window rate limiter (spec §32 rate limiting, §22 anti-bot).
// NOTE: in-memory only — correct for a single dev process. For staging/prod this
// MUST be swapped for a shared store (Redis/Upstash) so limits hold across
// instances. Flagged in docs/security-assessment.md.
interface Bucket {
  count: number;
  resetAt: number;
}
const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + opts.windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: opts.limit - 1, resetAt };
  }
  existing.count += 1;
  const allowed = existing.count <= opts.limit;
  return {
    allowed,
    remaining: Math.max(0, opts.limit - existing.count),
    resetAt: existing.resetAt,
  };
}
