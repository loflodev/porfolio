/* eslint-disable node/no-process-env */
import Stripe from 'stripe';

let client: Stripe | null = null;

// Lazily instantiate the Stripe client so a missing STRIPE_SECRET_KEY produces a controlled
// null (handled by callers as a clean error response) instead of crashing the function at
// module load time, before any handler code (including try/catch) runs.
export const getStripeClient = (): Stripe | null => {
  if (client) {
    return client;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  client = new Stripe(process.env.STRIPE_SECRET_KEY);

  return client;
};
