import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clearIdempotencyKey, getOrCreateIdempotencyKey } from './checkoutIdempotency';

const DAY_MS = 24 * 60 * 60 * 1000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-26T12:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('checkout idempotency keys', () => {
  it('mints a UUID and persists it per plan', () => {
    const key = getOrCreateIdempotencyKey('growth');

    expect(key).toMatch(UUID_RE);
    expect(JSON.parse(sessionStorage.getItem('checkout_idem_growth')!)).toEqual({
      key,
      createdAt: Date.now(),
    });
  });

  it('reuses the key for retries within 24h', () => {
    const key = getOrCreateIdempotencyKey('growth');
    vi.advanceTimersByTime(DAY_MS - 1);

    expect(getOrCreateIdempotencyKey('growth')).toBe(key);
  });

  it('mints a new key once the old one expires', () => {
    const key = getOrCreateIdempotencyKey('growth');
    vi.advanceTimersByTime(DAY_MS);

    expect(getOrCreateIdempotencyKey('growth')).not.toBe(key);
  });

  it('keeps separate keys per plan', () => {
    expect(getOrCreateIdempotencyKey('growth')).not.toBe(getOrCreateIdempotencyKey('essential'));
  });

  it('recovers from corrupt storage', () => {
    sessionStorage.setItem('checkout_idem_growth', '{not json');

    expect(getOrCreateIdempotencyKey('growth')).toMatch(UUID_RE);
  });

  it('mints a fresh key after being cleared', () => {
    const key = getOrCreateIdempotencyKey('growth');
    clearIdempotencyKey('growth');

    expect(sessionStorage.getItem('checkout_idem_growth')).toBeNull();
    expect(getOrCreateIdempotencyKey('growth')).not.toBe(key);
  });
});
