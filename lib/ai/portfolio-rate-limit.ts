import "server-only";

import { PORTFOLIO_AI_LIMITS } from "@/lib/ai/portfolio-limits";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export type PortfolioRateLimitResult = {
  limited: boolean;
  limit: number;
  remaining: number;
  resetAfterSeconds: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();
let nextCleanupAt = 0;

function pruneRateLimitStore(now: number) {
  if (
    now < nextCleanupAt &&
    rateLimitStore.size < PORTFOLIO_AI_LIMITS.rateLimitMaxTrackedClients
  ) {
    return;
  }

  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }

  while (
    rateLimitStore.size >= PORTFOLIO_AI_LIMITS.rateLimitMaxTrackedClients
  ) {
    const oldestKey = rateLimitStore.keys().next().value;

    if (typeof oldestKey !== "string") {
      break;
    }

    rateLimitStore.delete(oldestKey);
  }

  nextCleanupAt = now + PORTFOLIO_AI_LIMITS.rateLimitWindowMs;
}

export function consumePortfolioRateLimit(
  clientKey: string,
  now = Date.now(),
): PortfolioRateLimitResult {
  pruneRateLimitStore(now);

  const existing = rateLimitStore.get(clientKey);
  let entry: RateLimitEntry;

  if (!existing || existing.resetAt <= now) {
    entry = {
      count: 1,
      resetAt: now + PORTFOLIO_AI_LIMITS.rateLimitWindowMs,
    };
    rateLimitStore.set(clientKey, entry);
  } else {
    existing.count += 1;
    entry = existing;
  }

  return {
    limited: entry.count > PORTFOLIO_AI_LIMITS.rateLimitRequests,
    limit: PORTFOLIO_AI_LIMITS.rateLimitRequests,
    remaining: Math.max(
      0,
      PORTFOLIO_AI_LIMITS.rateLimitRequests - entry.count,
    ),
    resetAfterSeconds: Math.max(
      1,
      Math.ceil((entry.resetAt - now) / 1_000),
    ),
    resetAt: entry.resetAt,
  };
}
