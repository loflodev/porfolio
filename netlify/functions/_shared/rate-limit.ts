import type { HandlerEvent } from '@netlify/functions';

import { getBlobStore } from './blobs';

const MINUTES_PER_HOUR = 60;
const MINUTE_MS = 60_000;
const HOUR_MS = MINUTES_PER_HOUR * MINUTE_MS;
const MAX_PER_MINUTE = 5;
const MAX_PER_HOUR = 20;
const DEFAULT_RATE_LIMIT_STORE = 'checkout-rate-limit';
const EMPTY_COUNT = 0;
const INCREMENT = 1;
const FIRST_IP_INDEX = 0;
const MAX_CAS_ATTEMPTS = 5;
const ATTEMPT_STEP = 1;

type WindowCount = { count: number };
type Store = ReturnType<typeof getBlobStore>;

// A plain get-then-set would let concurrent requests from the same IP all read the same stale
// count and each write count+1, letting a burst blow past the limit. `onlyIfNew`/`onlyIfMatch`
// make each write a compare-and-swap, so a losing attempt retries against the latest value
// instead of silently under-counting.
const incrementWindowCount = async (store: Store, key: string): Promise<number> => {
  for (let attempt = 0; attempt < MAX_CAS_ATTEMPTS; attempt += ATTEMPT_STEP) {
    const existing = await store.getWithMetadata(key, { type: 'json' });
    const count =
      ((existing?.data as WindowCount | null | undefined)?.count ?? EMPTY_COUNT) + INCREMENT;
    const value = { count } satisfies WindowCount;

    const result = existing
      ? await store.setJSON(key, value, { onlyIfMatch: existing.etag })
      : await store.setJSON(key, value, { onlyIfNew: true });

    if (result.modified) {
      return count;
    }
  }

  // Contention held for every attempt (very unlikely at this traffic scale). Fail open rather
  // than blocking legitimate traffic indefinitely on a best-effort abuse deterrent.
  return EMPTY_COUNT;
};

const checkWindow = async (
  store: Store,
  ip: string,
  windowMs: number,
  max: number,
  label: string
): Promise<boolean> => {
  const bucket = Math.floor(Date.now() / windowMs);
  const key = `${ip}:${label}:${bucket}`;
  const count = await incrementWindowCount(store, key);

  return count > max;
};

export const isRateLimited = async (
  ip: string,
  storeName = DEFAULT_RATE_LIMIT_STORE
): Promise<boolean> => {
  const store = getBlobStore(storeName);
  const [minuteLimited, hourLimited] = await Promise.all([
    checkWindow(store, ip, MINUTE_MS, MAX_PER_MINUTE, 'm'),
    checkWindow(store, ip, HOUR_MS, MAX_PER_HOUR, 'h'),
  ]);

  return minuteLimited || hourLimited;
};

// `x-nf-client-connection-ip` is the header Netlify's edge populates with the caller's real IP;
// `x-forwarded-for` is kept as a fallback for local `netlify dev`.
export const resolveClientIp = (event: HandlerEvent): string =>
  event.headers['x-nf-client-connection-ip'] ||
  event.headers['x-forwarded-for']?.split(',')[FIRST_IP_INDEX]?.trim() ||
  'unknown';
