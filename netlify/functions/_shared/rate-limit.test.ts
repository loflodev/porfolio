import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFakeBlobStore, makeEvent, type FakeBlobStore } from '../_test/fakes';

const { getBlobStore, captureAndFlush } = vi.hoisted(() => ({
  getBlobStore: vi.fn(),
  captureAndFlush: vi.fn(),
}));

vi.mock('./blobs', () => ({ getBlobStore }));
vi.mock('./sentry', () => ({ captureAndFlush }));

const { isRateLimited, resolveClientIp } = await import('./rate-limit');

const MAX_PER_MINUTE = 5;
const MAX_PER_HOUR = 20;
const IP = '203.0.113.7';

let store: FakeBlobStore;

const hit = async (times: number, ip = IP) => {
  const results: boolean[] = [];
  for (let i = 0; i < times; i += 1) {
    results.push(await isRateLimited(ip));
  }
  return results;
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-26T12:00:00Z'));
  store = createFakeBlobStore();
  getBlobStore.mockReturnValue(store);
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('isRateLimited', () => {
  it(`allows ${MAX_PER_MINUTE} requests per minute and blocks the next`, async () => {
    const results = await hit(MAX_PER_MINUTE + 1);

    expect(results.slice(0, MAX_PER_MINUTE)).toEqual(Array(MAX_PER_MINUTE).fill(false));
    expect(results.at(-1)).toBe(true);
  });

  it('tracks each IP separately', async () => {
    await hit(MAX_PER_MINUTE + 1);

    expect(await isRateLimited('198.51.100.1')).toBe(false);
  });

  it('resets the minute window but keeps counting the hour', async () => {
    await hit(MAX_PER_MINUTE);
    vi.advanceTimersByTime(60_000);

    expect(await isRateLimited(IP)).toBe(false);
  });

  it(`blocks after ${MAX_PER_HOUR} requests in an hour even across minute windows`, async () => {
    for (let minute = 0; minute < MAX_PER_HOUR / MAX_PER_MINUTE; minute += 1) {
      expect(await hit(MAX_PER_MINUTE)).not.toContain(true);
      vi.advanceTimersByTime(60_000);
    }

    expect(await isRateLimited(IP)).toBe(true);
  });

  it('uses the store name it is given', async () => {
    await isRateLimited(IP, 'verify-checkout-rate-limit');

    expect(getBlobStore).toHaveBeenCalledWith('verify-checkout-rate-limit');
  });

  it('retries a conditional write that lost a race instead of under-counting', async () => {
    const realSet = store.setJSON;
    let conflicts = 1;
    store.setJSON = vi.fn(async (...args: Parameters<typeof realSet>) => {
      if (conflicts > 0) {
        conflicts -= 1;
        return { modified: false };
      }
      return realSet(...args);
    });

    await isRateLimited(IP);

    const counts = [...store.entries.values()].map((entry) => entry.data);
    expect(counts).toEqual([{ count: 1 }, { count: 1 }]);
  });

  it('fails open when every compare-and-swap attempt loses', async () => {
    store.setJSON = vi.fn(async () => ({ modified: false }));

    expect(await hit(MAX_PER_MINUTE + 3)).not.toContain(true);
  });

  it('fails open and reports to Sentry when the store throws', async () => {
    const error = new Error('blobs unavailable');
    getBlobStore.mockImplementation(() => {
      throw error;
    });

    expect(await isRateLimited(IP)).toBe(false);
    expect(captureAndFlush).toHaveBeenCalledWith(error);
  });
});

describe('resolveClientIp', () => {
  it('prefers the Netlify edge header', () => {
    const event = makeEvent({
      headers: { 'x-nf-client-connection-ip': '203.0.113.7', 'x-forwarded-for': '10.0.0.1' },
    });

    expect(resolveClientIp(event)).toBe('203.0.113.7');
  });

  it('falls back to the first x-forwarded-for entry', () => {
    const event = makeEvent({ headers: { 'x-forwarded-for': ' 10.0.0.1 , 10.0.0.2' } });

    expect(resolveClientIp(event)).toBe('10.0.0.1');
  });

  it('returns "unknown" without IP headers', () => {
    expect(resolveClientIp(makeEvent())).toBe('unknown');
  });
});
