import type { PlanSlug } from '../constants';

const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MS_PER_SECOND = 1000;
// Matches Stripe's own idempotency key retention window
const TTL_MS = HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND;

type StoredKey = {
  key: string;
  createdAt: number;
};

const storageKey = (planSlug: PlanSlug): string => `checkout_idem_${planSlug}`;

// Returns the same key across retries of the same checkout attempt (e.g. a manual retry after
// an ambiguous network timeout), so Stripe can dedupe them into a single Checkout Session. A new
// key is minted once the previous one is cleared (on success) or has expired.
export const getOrCreateIdempotencyKey = (planSlug: PlanSlug): string => {
  const raw = sessionStorage.getItem(storageKey(planSlug));

  if (raw) {
    try {
      const stored = JSON.parse(raw) as StoredKey;

      if (Date.now() - stored.createdAt < TTL_MS) {
        return stored.key;
      }
    } catch {
      // Fall through to generate a fresh key on parse failure.
    }
  }

  const stored: StoredKey = { key: crypto.randomUUID(), createdAt: Date.now() };
  sessionStorage.setItem(storageKey(planSlug), JSON.stringify(stored));

  return stored.key;
};

export const clearIdempotencyKey = (planSlug: PlanSlug): void => {
  sessionStorage.removeItem(storageKey(planSlug));
};
