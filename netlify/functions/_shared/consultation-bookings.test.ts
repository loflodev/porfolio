import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createFakeBlobStore, makeEvent, type FakeBlobStore } from '../_test/fakes';

const { getBlobStore } = vi.hoisted(() => ({ getBlobStore: vi.fn() }));

vi.mock('./blobs', () => ({ getBlobStore }));

const { getTakenSlots, releaseSlot, reserveSlot } = await import('./consultation-bookings');

const EVENT = makeEvent();
const BOOKING = { fullName: 'Ada', email: 'ada@example.com', bookedAt: '2026-10-26T12:00:00Z' };

let store: FakeBlobStore;

beforeEach(() => {
  store = createFakeBlobStore();
  getBlobStore.mockReturnValue(store);
});

describe('consultation bookings', () => {
  it('reserves a free slot once and refuses it afterwards', async () => {
    expect(await reserveSlot(EVENT, '2026-10-27', '09:00', BOOKING)).toBe(true);
    expect(await reserveSlot(EVENT, '2026-10-27', '09:00', { ...BOOKING, fullName: 'Bob' })).toBe(
      false
    );
    expect(await reserveSlot(EVENT, '2026-10-27', '09:30', BOOKING)).toBe(true);

    expect(await getTakenSlots(EVENT, '2026-10-27')).toEqual(new Set(['09:00', '09:30']));
    expect(await getTakenSlots(EVENT, '2026-10-28')).toEqual(new Set());
  });

  it('lets only one of two simultaneous requests win the same slot', async () => {
    const results = await Promise.all([
      reserveSlot(EVENT, '2026-10-27', '10:00', BOOKING),
      reserveSlot(EVENT, '2026-10-27', '10:00', { ...BOOKING, fullName: 'Bob' }),
    ]);

    expect(results.filter(Boolean)).toHaveLength(1);
  });

  it('keeps both bookings when two different slots are reserved at once', async () => {
    await Promise.all([
      reserveSlot(EVENT, '2026-10-27', '10:00', BOOKING),
      reserveSlot(EVENT, '2026-10-27', '11:00', BOOKING),
    ]);

    expect(await getTakenSlots(EVENT, '2026-10-27')).toEqual(new Set(['10:00', '11:00']));
  });

  it('releases a slot so it can be booked again', async () => {
    await reserveSlot(EVENT, '2026-10-27', '09:00', BOOKING);
    await releaseSlot(EVENT, '2026-10-27', '09:00');

    expect(await getTakenSlots(EVENT, '2026-10-27')).toEqual(new Set());
    await expect(releaseSlot(EVENT, '2026-10-29', '09:00')).resolves.toBeUndefined();
  });
});
