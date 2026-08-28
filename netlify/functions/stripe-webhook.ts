/* eslint-disable node/no-process-env */
import type { Handler, HandlerEvent } from '@netlify/functions';
import Stripe from 'stripe';

import { captureAndFlush, initSentry } from './_shared/sentry';

initSentry();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_METHOD_NOT_ALLOWED = 405;

const CHECKOUT_SESSION_COMPLETED = 'checkout.session.completed';

const getRawBody = (event: HandlerEvent): Buffer =>
  event.isBase64Encoded
    ? Buffer.from(event.body ?? '', 'base64')
    : Buffer.from(event.body ?? '', 'utf8');

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: HTTP_METHOD_NOT_ALLOWED, body: 'Method Not Allowed' };
  }

  const signature = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return { statusCode: HTTP_BAD_REQUEST, body: 'Missing signature or webhook secret' };
  }

  let stripeEvent: Stripe.Event;

  try {
    stripeEvent = stripe.webhooks.constructEvent(getRawBody(event), signature, webhookSecret);
  } catch (error) {
    await captureAndFlush(error);
    return { statusCode: HTTP_BAD_REQUEST, body: 'Webhook signature verification failed' };
  }

  try {
    // No email code needed here: Stripe's own Dashboard settings (Customer emails +
    // each user's Communication preferences) already notify both the customer and the
    // merchant on a successful payment. This handler only needs to acknowledge receipt.
    if (stripeEvent.type === CHECKOUT_SESSION_COMPLETED) {
      return { statusCode: HTTP_OK, body: JSON.stringify({ received: true }) };
    }

    return { statusCode: HTTP_OK, body: JSON.stringify({ received: true }) };
  } catch (error) {
    await captureAndFlush(error);
    return { statusCode: HTTP_OK, body: JSON.stringify({ received: true }) };
  }
};
