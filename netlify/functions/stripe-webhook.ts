/* eslint-disable node/no-process-env */
import type { Handler, HandlerEvent } from '@netlify/functions';
import type Stripe from 'stripe';

import { getBlobStore } from './_shared/blobs';
import { submitToNetlifyForms } from './_shared/netlify-forms';
import { signPurchase } from './_shared/purchase-signature';
import { captureAndFlush, initSentry } from './_shared/sentry';
import { getStripeClient } from './_shared/stripe-client';

initSentry();

const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_METHOD_NOT_ALLOWED = 405;
const HTTP_INTERNAL_SERVER_ERROR = 500;

const CHECKOUT_SESSION_COMPLETED = 'checkout.session.completed';
const PROCESSED_EVENTS_STORE = 'stripe-processed-events';

const getRawBody = (event: HandlerEvent): Buffer =>
  event.isBase64Encoded
    ? Buffer.from(event.body ?? '', 'base64')
    : Buffer.from(event.body ?? '', 'utf8');

const buildPurchaseFields = (session: Stripe.Checkout.Session): Record<string, string> => ({
  planSlug: session.metadata?.plan ?? '',
  stripeSessionId: session.id,
  amountTotal: session.amount_total !== null ? String(session.amount_total) : '',
  currency: session.currency ?? '',
  customerEmail: session.customer_details?.email ?? session.customer_email ?? '',
  timestamp: new Date().toISOString(),
  verificationToken: signPurchase(session.id),
});

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: HTTP_METHOD_NOT_ALLOWED, body: 'Method Not Allowed' };
  }

  const signature = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return { statusCode: HTTP_BAD_REQUEST, body: 'Missing signature or webhook secret' };
  }

  const stripe = getStripeClient();

  if (!stripe) {
    await captureAndFlush(new Error('Missing STRIPE_SECRET_KEY'));
    return { statusCode: HTTP_INTERNAL_SERVER_ERROR, body: 'Server misconfigured' };
  }

  let stripeEvent: Stripe.Event;

  try {
    stripeEvent = stripe.webhooks.constructEvent(getRawBody(event), signature, webhookSecret);
  } catch (error) {
    await captureAndFlush(error);
    return { statusCode: HTTP_BAD_REQUEST, body: 'Webhook signature verification failed' };
  }

  try {
    if (stripeEvent.type !== CHECKOUT_SESSION_COMPLETED) {
      return { statusCode: HTTP_OK, body: JSON.stringify({ received: true }) };
    }

    const processedEvents = getBlobStore(PROCESSED_EVENTS_STORE);
    // Atomically claim this event id before doing any work: `onlyIfNew` makes this a
    // compare-and-swap, so two concurrent deliveries of the same event can't both pass a
    // read-then-write dedup check and both submit the purchase form.
    const claim = await processedEvents.setJSON(
      stripeEvent.id,
      { processedAt: Date.now() },
      { onlyIfNew: true }
    );

    if (!claim.modified) {
      return { statusCode: HTTP_OK, body: JSON.stringify({ received: true, duplicate: true }) };
    }

    try {
      // Stripe's own Dashboard settings (Customer emails + Communication preferences) already
      // notify the customer on a successful payment. This handler persists a purchase record
      // (via Netlify Forms, matching this project's serverless/no-database setup) and notifies
      // the admin, both handled downstream by submission-created.ts.
      const session = stripeEvent.data.object as Stripe.Checkout.Session;

      await submitToNetlifyForms('purchase', buildPurchaseFields(session));
    } catch (error) {
      // Roll back the claim so a Stripe retry can attempt this event again instead of being
      // silently swallowed by the dedup check above.
      await processedEvents.delete(stripeEvent.id);
      throw error;
    }

    return { statusCode: HTTP_OK, body: JSON.stringify({ received: true }) };
  } catch (error) {
    await captureAndFlush(error);
    // A failure here must NOT return 200: the purchase record didn't get persisted, so Stripe
    // should retry delivery. The claim rollback above ensures the retry isn't blocked as a dupe.
    return { statusCode: HTTP_INTERNAL_SERVER_ERROR, body: JSON.stringify({ received: false }) };
  }
};
