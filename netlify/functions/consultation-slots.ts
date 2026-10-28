import type { Handler, HandlerEvent } from '@netlify/functions';

import { getTakenSlots, getTakenSlotsByDate } from './_shared/consultation-bookings';
import { bookableDates, daySchedule, isValidDate, todayInZone } from './_shared/consultation-slots';
import { getHeaders } from './_shared/cors';
import { isRateLimited } from './_shared/rate-limit';
import { captureAndFlush, initSentry } from './_shared/sentry';

initSentry();

const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_METHOD_NOT_ALLOWED = 405;
const HTTP_TOO_MANY_REQUESTS = 429;
const HTTP_SERVICE_UNAVAILABLE = 503;
const SLOTS_RATE_LIMIT_STORE = 'consultation-slots-rate-limit';
// Visitors try several dates while choosing, so reads get more room than checkout does.
const SLOTS_RATE_LIMITS = { perMinute: 30, perHour: 200 };

const resolveEventOrigin = (event: HandlerEvent): string | undefined =>
  event.headers.origin || event.headers.Origin;

const jsonResponse = (
  headers: Record<string, string>,
  body: Record<string, unknown>,
  statusCode = HTTP_OK
) => ({
  statusCode,
  headers,
  body: JSON.stringify(body),
});

const schedule = async (event: HandlerEvent, date: string) => ({
  date,
  slots: daySchedule(date, Date.now(), await getTakenSlots(event, date)),
});

const openDates = async (event: HandlerEvent) => {
  const now = Date.now();
  return { dates: bookableDates(now, await getTakenSlotsByDate(event, todayInZone(now))) };
};

// GET ?date=YYYY-MM-DD → { date, slots: [{ time: '09:00', available }, …] }: every consultation
// time of that day, available unless booked or too soon (none on weekends or outside the window).
// GET without a date → { dates: ['YYYY-MM-DD', …] }: the days that still have an open time.
export const handler: Handler = async (event: HandlerEvent) => {
  const headers = getHeaders(resolveEventOrigin(event), 'GET, OPTIONS');

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: HTTP_OK, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: HTTP_METHOD_NOT_ALLOWED, headers, body: 'Method Not Allowed' };
  }

  if (await isRateLimited(event, SLOTS_RATE_LIMIT_STORE, SLOTS_RATE_LIMITS)) {
    return jsonResponse(headers, { error: 'Too many requests' }, HTTP_TOO_MANY_REQUESTS);
  }

  const date = event.queryStringParameters?.date;

  if (date !== undefined && !isValidDate(date)) {
    return jsonResponse(headers, { error: 'Invalid date' }, HTTP_BAD_REQUEST);
  }

  try {
    return jsonResponse(
      headers,
      date === undefined ? await openDates(event) : await schedule(event, date)
    );
  } catch (error) {
    await captureAndFlush(error);
    return jsonResponse(headers, { error: 'Slots unavailable' }, HTTP_SERVICE_UNAVAILABLE);
  }
};
