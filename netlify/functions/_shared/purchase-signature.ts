/* eslint-disable node/no-process-env */
import { createHmac, timingSafeEqual } from 'node:crypto';

// The "purchase" Netlify Form is submitted server-to-server from stripe-webhook.ts, but Netlify
// Forms' endpoint is otherwise public (same as the existing "contact" form) — anyone could POST
// a forged submission directly. Signing the Stripe session id with the webhook secret (known
// only server-side) lets submission-created.ts reject anything that didn't originate from our
// own webhook handler, without needing a dedicated new secret.
export const signPurchase = (stripeSessionId: string): string =>
  createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET || '')
    .update(stripeSessionId)
    .digest('hex');

export const verifyPurchaseSignature = (stripeSessionId: string, token: string): boolean => {
  if (!process.env.STRIPE_WEBHOOK_SECRET || !token) {
    return false;
  }

  const expected = Buffer.from(signPurchase(stripeSessionId), 'hex');
  const actual = Buffer.from(token, 'hex');

  return expected.length === actual.length && timingSafeEqual(expected, actual);
};
