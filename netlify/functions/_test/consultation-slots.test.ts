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
  it('lists every slot of a day, booked ones unavailable', async () => {
    await store.setJSON('2026-10-27', { '09:00': { fullName: 'Ada' } });

    const result = await get('2026-10-27');
    const body = parseBody(result);

    expect(result.statusCode).toBe(200);
    expect(body.date).toBe('2026-10-27');
    expect(body.slots).toHaveLength(16);
    expect(body.slots[0]).toEqual({ time: '09:00', available: false });
    expect(body.slots[1]).toEqual({ time: '09:30', available: true });
  });

  it('lists the bookable days when no date is given, skipping fully booked ones', async () => {
    const fullDay = Object.fromEntries(
      Array.from({ length: 16 }, (_, index) => [
        `${String(9 + Math.floor(index / 2)).padStart(2, '0')}:${index % 2 ? '30' : '00'}`,
        { fullName: 'Ada' },
      ])
    );
    await store.setJSON('2026-10-28', fullDay);
    await store.setJSON('2026-10-01', fullDay); // past day, ignored

    const result = await get();
    const { dates } = parseBody(result);

    expect(result.statusCode).toBe(200);
    expect(dates.slice(0, 3)).toEqual(['2026-10-26', '2026-10-27', '2026-10-29']);
    expect(dates).not.toContain('2026-10-31');
  });

  it('returns no slots on a weekend', async () => {
    expect(parseBody(await get('2026-10-31')).slots).toEqual([]);
  });

  it('rejects a malformed date', async () => {
    expect((await get('')).statusCode).toBe(400);
    expect((await get('2026-13-01')).statusCode).toBe(400);
  });

  it('only answers GET and OPTIONS', async () => {
    expect((await get('2026-10-27', 'POST')).statusCode).toBe(405);
    expect((await get('2026-10-27', 'OPTIONS')).statusCode).toBe(200);
  });

  it('rate limits callers, with room for trying several dates', async () => {
    isRateLimited.mockResolvedValue(true);

    expect((await get('2026-10-27')).statusCode).toBe(429);
    expect(isRateLimited).toHaveBeenCalledWith(expect.anything(), expect.any(String), {
      perMinute: 30,
      perHour: 200,
    });
  });

  it('reports a store failure as 503', async () => {
    getBlobStore.mockImplementation(() => {
      throw new Error('blobs down');
    });

    expect((await get('2026-10-27')).statusCode).toBe(503);
    expect(captureAndFlush).toHaveBeenCalled();
  });
});
