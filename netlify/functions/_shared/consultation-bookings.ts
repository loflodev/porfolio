import type { HandlerEvent } from '@netlify/functions';

import { getBlobStore } from './blobs';

const BOOKINGS_STORE = 'consultation-bookings';
const MAX_CAS_ATTEMPTS = 5;
const ATTEMPT_STEP = 1;

export type Booking = { fullName: string; email: string; bookedAt: string };
// One blob per day, keyed by Montreal-local date, mapping HH:MM to who booked it.
type DayBookings = Record<string, Booking>;
type Store = ReturnType<typeof getBlobStore>;

const readDay = async (store: Store, date: string) => {
  const existing = await store.getWithMetadata(date, { type: 'json' });
  return { existing, bookings: (existing?.data as DayBookings | null | undefined) ?? {} };
};

// Writes the day's bookings only if nobody changed them since they were read (`onlyIfNew` /
// `onlyIfMatch`), so two visitors racing for the same slot can't both win.
const writeDay = async (
  store: Store,
  date: string,
  existing: Awaited<ReturnType<typeof readDay>>['existing'],
  bookings: DayBookings
): Promise<boolean> => {
  const result = existing
    ? await store.setJSON(date, bookings, { onlyIfMatch: existing.etag })
    : await store.setJSON(date, bookings, { onlyIfNew: true });

  return result.modified;
};

export const getTakenSlots = async (event: HandlerEvent, date: string): Promise<Set<string>> => {
  const { bookings } = await readDay(getBlobStore(BOOKINGS_STORE, event), date);
  return new Set(Object.keys(bookings));
};

/** Reserves a slot; false when it's already taken. Throws if the store stays contended. */
export const reserveSlot = async (
  event: HandlerEvent,
  date: string,
  time: string,
  booking: Booking
) => {
  const store = getBlobStore(BOOKINGS_STORE, event);

  for (let attempt = 0; attempt < MAX_CAS_ATTEMPTS; attempt += ATTEMPT_STEP) {
    const { existing, bookings } = await readDay(store, date);

    if (bookings[time]) {
      return false;
    }
    if (await writeDay(store, date, existing, { ...bookings, [time]: booking })) {
      return true;
    }
  }

  throw new Error(`Could not reserve consultation slot ${date} ${time}: store contention`);
};

/** Frees a slot again, e.g. when recording the booking failed after reserving it. */
export const releaseSlot = async (
  event: HandlerEvent,
  date: string,
  time: string
): Promise<void> => {
  const store = getBlobStore(BOOKINGS_STORE, event);

  for (let attempt = 0; attempt < MAX_CAS_ATTEMPTS; attempt += ATTEMPT_STEP) {
    const { existing, bookings } = await readDay(store, date);

    if (!existing || !bookings[time]) {
      return;
    }

    const { [time]: _released, ...rest } = bookings;
    if (await writeDay(store, date, existing, rest)) {
      return;
    }
  }

  throw new Error(`Could not release consultation slot ${date} ${time}: store contention`);
};
