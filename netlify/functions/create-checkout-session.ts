/* eslint-disable node/no-process-env */
import type { Handler, HandlerEvent } from '@netlify/functions';
import Stripe from 'stripe';

import { getHeaders } from './_shared/cors';
import { captureAndFlush, initSentry } from './_shared/sentry';
import { PLAN_SLUGS, type PlanSlug } from '../../src/constants/app.constants';

initSentry();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_METHOD_NOT_ALLOWED = 405;
const HTTP_INTERNAL_SERVER_ERROR = 500;

const CHECKOUT_START_ERROR = 'Unable to start checkout';

type CheckoutRequestBody = {
  plan?: string;
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

export const handler: Handler = async (event: HandlerEvent) => {
  const headers = getHeaders(resolveEventOrigin(event));

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: HTTP_OK, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(headers, HTTP_METHOD_NOT_ALLOWED, { error: 'Method Not Allowed' });
  }

  try {
    const { plan } = parseBody(event.body);

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

    const siteUrl = process.env.URL || 'http://localhost:8888';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/pricing?checkout=success`,
      cancel_url: `${siteUrl}/pricing?checkout=cancelled`,
    });

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
