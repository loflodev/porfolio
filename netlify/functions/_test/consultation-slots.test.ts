import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createFakeBlobStore,
  makeEvent,
  parseBody,
  type FakeBlobStore,
  type HandlerResult,
} from './fakes';

const { captureAndFlush, getBlobStore, isRateLimited } = vi.hoisted(() => ({
  captureAndFlush: vi.fn(),
  getBlobStore: vi.fn(),
  isRateLimited: vi.fn(),
}));

vi.mock('../_shared/sentry', () => ({ initSentry: vi.fn(), captureAndFlush }));
vi.mock('../_shared/blobs', () => ({ getBlobStore }));
vi.mock('../_shared/rate-limit', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../_shared/rate-limit')>()),
  isRateLimited,
}));

const { handler } = await import('../consultation-slots');

const get = (date?: string, httpMethod = 'GET') =>
  handler(
    makeEvent({ httpMethod, queryStringParameters: date === undefined ? null : { date } }),
    {} as never
  ) as Promise<HandlerResult>;

let store: FakeBlobStore;

beforeEach(() => {
  vi.useFakeTimers();
  // Monday 26 October 2026, 08:00 in Montreal.
  vi.setSystemTime(new Date('2026-10-26T12:00:00Z'));
  store = createFakeBlobStore();
  getBlobStore.mockReturnValue(store);
  isRateLimited.mockResolvedValue(false);
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('consultation-slots', () => {
  it('lists the open slots of a day, without booked ones', async () => {
    await store.setJSON('2026-10-27', { '09:00': { fullName: 'Ada' } });

    const result = await get('2026-10-27');
    const body = parseBody(result);

    expect(result.statusCode).toBe(200);
    expect(body.date).toBe('2026-10-27');
    expect(body.slots[0]).toBe('09:30');
    expect(body.slots).toHaveLength(15);
  });

  it('returns no slots on a weekend', async () => {
    expect(parseBody(await get('2026-10-31')).slots).toEqual([]);
  });

  it('rejects a missing or malformed date', async () => {
    expect((await get()).statusCode).toBe(400);
    expect((await get('2026-13-01')).statusCode).toBe(400);
  });

  it('only answers GET and OPTIONS', async () => {
    expect((await get('2026-10-27', 'POST')).statusCode).toBe(405);
    expect((await get('2026-10-27', 'OPTIONS')).statusCode).toBe(200);
  });

  it('rate limits callers', async () => {
    isRateLimited.mockResolvedValue(true);

    expect((await get('2026-10-27')).statusCode).toBe(429);
  });

  it('reports a store failure as 503', async () => {
    getBlobStore.mockImplementation(() => {
      throw new Error('blobs down');
    });

    expect((await get('2026-10-27')).statusCode).toBe(503);
    expect(captureAndFlush).toHaveBeenCalled();
  });
});
