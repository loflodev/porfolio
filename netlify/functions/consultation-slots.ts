import type { Handler, HandlerEvent } from '@netlify/functions';

import { getTakenSlots } from './_shared/consultation-bookings';
import { availableSlots, isValidDate } from './_shared/consultation-slots';
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

// GET ?date=YYYY-MM-DD → { date, slots: ['09:00', …] }: the consultation times still open that
// day (weekday, in the booking window, not too soon, not already booked).
export const handler: Handler = async (event: HandlerEvent) => {
  const headers = getHeaders(resolveEventOrigin(event), 'GET, OPTIONS');

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: HTTP_OK, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: HTTP_METHOD_NOT_ALLOWED, headers, body: 'Method Not Allowed' };
  }

  if (await isRateLimited(event, SLOTS_RATE_LIMIT_STORE)) {
    return jsonResponse(headers, { error: 'Too many requests' }, HTTP_TOO_MANY_REQUESTS);
  }

  const date = event.queryStringParameters?.date ?? '';

  if (!isValidDate(date)) {
    return jsonResponse(headers, { error: 'Invalid date' }, HTTP_BAD_REQUEST);
  }

  try {
    const slots = availableSlots(date, Date.now(), await getTakenSlots(event, date));
    return jsonResponse(headers, { date, slots });
  } catch (error) {
    await captureAndFlush(error);
    return jsonResponse(headers, { error: 'Slots unavailable' }, HTTP_SERVICE_UNAVAILABLE);
  }
};
