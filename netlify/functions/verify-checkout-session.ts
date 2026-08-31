import type { Handler, HandlerEvent } from '@netlify/functions';

import { getHeaders } from './_shared/cors';
import { isRateLimited, resolveClientIp } from './_shared/rate-limit';
import { captureAndFlush, initSentry } from './_shared/sentry';
import { getStripeClient } from './_shared/stripe-client';

initSentry();

const HTTP_OK = 200;
const HTTP_METHOD_NOT_ALLOWED = 405;
const HTTP_TOO_MANY_REQUESTS = 429;
const VERIFY_RATE_LIMIT_STORE = 'verify-checkout-rate-limit';
const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const SESSION_MAX_AGE_SECONDS = HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE;
const MS_PER_SECOND = 1000;

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

export const handler: Handler = async (event: HandlerEvent) => {
  const headers = getHeaders(resolveEventOrigin(event), 'GET, OPTIONS');

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: HTTP_OK, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: HTTP_METHOD_NOT_ALLOWED, headers, body: 'Method Not Allowed' };
  }

  if (await isRateLimited(resolveClientIp(event), VERIFY_RATE_LIMIT_STORE)) {
    return jsonResponse(headers, { verified: false }, HTTP_TOO_MANY_REQUESTS);
  }

  const sessionId = event.queryStringParameters?.session_id;

  if (typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) {
    return jsonResponse(headers, { verified: false });
  }

  const stripe = getStripeClient();

  if (!stripe) {
    await captureAndFlush(new Error('Missing STRIPE_SECRET_KEY'));
    return jsonResponse(headers, { verified: false });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const ageSeconds = Date.now() / MS_PER_SECOND - session.created;
    const verified = session.payment_status === 'paid' && ageSeconds < SESSION_MAX_AGE_SECONDS;

    return jsonResponse(headers, { verified, planSlug: session.metadata?.plan ?? null });
  } catch (error) {
    await captureAndFlush(error);
    return jsonResponse(headers, { verified: false });
  }
};
