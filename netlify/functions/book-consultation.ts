import type { Handler, HandlerEvent } from '@netlify/functions';

import { releaseSlot, reserveSlot } from './_shared/consultation-bookings';
import { signConsultation } from './_shared/consultation-signature';
import { isBookableSlot } from './_shared/consultation-slots';
import { getHeaders } from './_shared/cors';
import { submitToNetlifyForms } from './_shared/netlify-forms';
import { isRateLimited } from './_shared/rate-limit';
import { captureAndFlush, initSentry } from './_shared/sentry';
import {
  CONSULTATION_SUBJECT,
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
} from '../../src/constants/app.constants';

initSentry();

const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_METHOD_NOT_ALLOWED = 405;
const HTTP_CONFLICT = 409;
const HTTP_TOO_MANY_REQUESTS = 429;
const HTTP_BAD_GATEWAY = 502;
const BOOKING_RATE_LIMIT_STORE = 'book-consultation-rate-limit';
const CONTACT_FORM_NAME = 'contact';
const EMPTY_LENGTH = 0;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type BookingRequest = {
  fullName: string;
  email: string;
  consultationDate: string;
  consultationTime: string;
  website: string;
};

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

const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const parseRequest = (body: string | null): BookingRequest => {
  try {
    const raw = JSON.parse(body || '{}') as Record<string, unknown>;
    return {
      fullName: text(raw.fullName),
      email: text(raw.email).toLowerCase(),
      consultationDate: text(raw.consultationDate),
      consultationTime: text(raw.consultationTime),
      website: text(raw.website),
    };
  } catch {
    return { fullName: '', email: '', consultationDate: '', consultationTime: '', website: '' };
  }
};

const hasValidContact = ({ fullName, email }: BookingRequest): boolean =>
  fullName.length > EMPTY_LENGTH &&
  fullName.length <= MAX_NAME_LENGTH &&
  email.length <= MAX_EMAIL_LENGTH &&
  EMAIL_PATTERN.test(email);

// Records the booking as a "contact" submission so it shows in Netlify Forms next to every other
// inquiry; submission-created.ts emails it once the signature checks out.
const recordBooking = (request: BookingRequest) =>
  submitToNetlifyForms(CONTACT_FORM_NAME, {
    fullName: request.fullName,
    email: request.email,
    subject: CONSULTATION_SUBJECT,
    consultationDate: request.consultationDate,
    consultationTime: request.consultationTime,
    verificationToken: signConsultation(
      request.consultationDate,
      request.consultationTime,
      request.email
    ),
  });

// POST { fullName, email, consultationDate, consultationTime, website } → reserves the slot
// (409 { error: 'slotTaken' } if someone got it first) and records the booking.
export const handler: Handler = async (event: HandlerEvent) => {
  const headers = getHeaders(resolveEventOrigin(event));

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: HTTP_OK, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: HTTP_METHOD_NOT_ALLOWED, headers, body: 'Method Not Allowed' };
  }

  if (await isRateLimited(event, BOOKING_RATE_LIMIT_STORE)) {
    return jsonResponse(
      headers,
      { success: false, error: 'tooManyRequests' },
      HTTP_TOO_MANY_REQUESTS
    );
  }

  const request = parseRequest(event.body);

  // Honeypot filled: a bot. Pretend it worked so it learns nothing, but book nothing.
  if (request.website) {
    return jsonResponse(headers, { success: true });
  }

  const { consultationDate: date, consultationTime: time } = request;

  if (!hasValidContact(request) || !isBookableSlot(date, time, Date.now())) {
    return jsonResponse(headers, { success: false, error: 'invalidRequest' }, HTTP_BAD_REQUEST);
  }

  try {
    const booking = {
      fullName: request.fullName,
      email: request.email,
      bookedAt: new Date().toISOString(),
    };

    if (!(await reserveSlot(event, date, time, booking))) {
      return jsonResponse(headers, { success: false, error: 'slotTaken' }, HTTP_CONFLICT);
    }
  } catch (error) {
    await captureAndFlush(error);
    return jsonResponse(headers, { success: false, error: 'unavailable' }, HTTP_BAD_GATEWAY);
  }

  try {
    await recordBooking(request);
    return jsonResponse(headers, { success: true });
  } catch (error) {
    // Nobody will hear about this booking, so give the slot back rather than leave it blocked.
    await captureAndFlush(error);
    await releaseSlot(event, date, time).catch(captureAndFlush);
    return jsonResponse(headers, { success: false, error: 'unavailable' }, HTTP_BAD_GATEWAY);
  }
};
