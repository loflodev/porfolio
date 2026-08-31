/* eslint-disable node/no-process-env */
import type { Handler, HandlerEvent } from '@netlify/functions';
import type Stripe from 'stripe';

import { getHeaders } from './_shared/cors';
import { isRateLimited, resolveClientIp } from './_shared/rate-limit';
import { captureAndFlush, initSentry } from './_shared/sentry';
import { resolveSiteUrl } from './_shared/site-url';
import { getStripeClient } from './_shared/stripe-client';
import { PLAN_SLUGS, type PlanSlug } from '../../src/constants/app.constants';

initSentry();

const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_METHOD_NOT_ALLOWED = 405;
const HTTP_TOO_MANY_REQUESTS = 429;
const HTTP_INTERNAL_SERVER_ERROR = 500;

const CHECKOUT_START_ERROR = 'Unable to start checkout';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SUPPORTED_STRIPE_LOCALES = new Set(['en', 'es', 'fr']);

type CheckoutRequestBody = {
  plan?: string;
  locale?: string;
};

type JsonResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

const jsonResponse = (
  headers: Record<string, string>,
  statusCode: number,
  body: Record<string, unknown>
): JsonResponse => ({
  statusCode,
  headers,
  body: JSON.stringify(body),
});

const isPlanSlug = (value: unknown): value is PlanSlug =>
  typeof value === 'string' && (PLAN_SLUGS as readonly string[]).includes(value);

const PLAN_PRICE_ENV: Record<PlanSlug, string | undefined> = {
  essential: process.env.STRIPE_PRICE_ESSENTIAL,
  growth: process.env.STRIPE_PRICE_GROWTH,
};

const resolveEventOrigin = (event: HandlerEvent): string | undefined =>
  event.headers.origin || event.headers.Origin;

const parseBody = (body: string | null): CheckoutRequestBody => JSON.parse(body || '{}');

// A missing/malformed idempotency key is ignored (checkout still proceeds without dedup
// protection) rather than rejected outright, so a client with sessionStorage blocked/cleared
// doesn't lose the ability to check out. Only a syntactically valid UUID is ever forwarded to
// the Stripe SDK.
const resolveIdempotencyKey = (event: HandlerEvent): string | undefined => {
  const rawKey = event.headers['x-idempotency-key'] || event.headers['X-Idempotency-Key'];

  return typeof rawKey === 'string' && UUID_RE.test(rawKey) ? rawKey : undefined;
};

const resolveLocale = (locale: unknown): Stripe.Checkout.SessionCreateParams.Locale =>
  typeof locale === 'string' && SUPPORTED_STRIPE_LOCALES.has(locale)
    ? (locale as Stripe.Checkout.SessionCreateParams.Locale)
    : 'auto';

export const handler: Handler = async (event: HandlerEvent) => {
  const headers = getHeaders(resolveEventOrigin(event));

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: HTTP_OK, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(headers, HTTP_METHOD_NOT_ALLOWED, { error: 'Method Not Allowed' });
  }

  const clientIp = resolveClientIp(event);

  if (await isRateLimited(clientIp)) {
    return jsonResponse(headers, HTTP_TOO_MANY_REQUESTS, {
      success: false,
      error: 'Too many requests',
    });
  }

  try {
    const { plan, locale } = parseBody(event.body);

    if (!isPlanSlug(plan)) {
      return jsonResponse(headers, HTTP_BAD_REQUEST, { success: false, error: 'Invalid plan' });
    }

    const priceId = PLAN_PRICE_ENV[plan];

    if (!priceId) {
      await captureAndFlush(new Error(`Missing Stripe price env var for plan: ${plan}`));
      return jsonResponse(headers, HTTP_INTERNAL_SERVER_ERROR, {
        success: false,
        error: CHECKOUT_START_ERROR,
      });
    }

    if (!priceId.startsWith('price_')) {
      await captureAndFlush(
        new Error(
          `STRIPE_PRICE_${plan.toUpperCase()} looks like a Product ID (prod_...), not a Price ID (price_...): ${priceId}`
        )
      );
      return jsonResponse(headers, HTTP_INTERNAL_SERVER_ERROR, {
        success: false,
        error: CHECKOUT_START_ERROR,
      });
    }

    const stripe = getStripeClient();

    if (!stripe) {
      await captureAndFlush(new Error('Missing STRIPE_SECRET_KEY'));
      return jsonResponse(headers, HTTP_INTERNAL_SERVER_ERROR, {
        success: false,
        error: CHECKOUT_START_ERROR,
      });
    }

    const siteUrl = resolveSiteUrl();
    const idempotencyKey = resolveIdempotencyKey(event);

    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${siteUrl}/pricing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/pricing?checkout=cancelled`,
        locale: resolveLocale(locale),
        metadata: { plan },
        client_reference_id: idempotencyKey,
      },
      idempotencyKey ? { idempotencyKey } : undefined
    );

    if (!session.url) {
      await captureAndFlush(new Error('Stripe Checkout Session created without a url'));
      return jsonResponse(headers, HTTP_INTERNAL_SERVER_ERROR, {
        success: false,
        error: CHECKOUT_START_ERROR,
      });
    }

    return jsonResponse(headers, HTTP_OK, { success: true, url: session.url });
  } catch (error) {
    await captureAndFlush(error);
    return jsonResponse(headers, HTTP_INTERNAL_SERVER_ERROR, {
      success: false,
      error: CHECKOUT_START_ERROR,
    });
  }
};
