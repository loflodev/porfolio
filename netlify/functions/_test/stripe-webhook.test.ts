import Stripe from 'stripe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createFakeBlobStore,
  makeEvent,
  parseBody,
  type FakeBlobStore,
  type HandlerResult,
} from './fakes';
import { signPurchase } from '../_shared/purchase-signature';

const { captureAndFlush, getStripeClient, getBlobStore, submitToNetlifyForms } = vi.hoisted(() => ({
  captureAndFlush: vi.fn(),
  getStripeClient: vi.fn(),
  getBlobStore: vi.fn(),
  submitToNetlifyForms: vi.fn(),
}));

vi.mock('../_shared/sentry', () => ({ initSentry: vi.fn(), captureAndFlush }));
vi.mock('../_shared/stripe-client', () => ({ getStripeClient }));
vi.mock('../_shared/blobs', () => ({ getBlobStore }));
vi.mock('../_shared/netlify-forms', () => ({ submitToNetlifyForms }));

const { handler } = await import('../stripe-webhook');

const WEBHOOK_SECRET = 'whsec_test_secret';
// A real client so signature verification runs through Stripe's own constructEvent.
const stripe = new Stripe('sk_test_dummy');

const SESSION = {
  id: 'cs_test_1',
  object: 'checkout.session',
  metadata: { plan: 'growth' },
  amount_total: 150000,
  currency: 'cad',
  customer_details: { email: 'buyer@example.com' },
  customer_email: null,
};

const stripeEvent = (type = 'checkout.session.completed', id = 'evt_1') => ({
  id,
  object: 'event',
  type,
  data: { object: SESSION },
});

const signedEvent = (payload: object, { base64 = false, secret = WEBHOOK_SECRET } = {}) => {
  const body = JSON.stringify(payload);
  const signature = stripe.webhooks.generateTestHeaderString({ payload: body, secret });

  return makeEvent({
    httpMethod: 'POST',
    body: base64 ? Buffer.from(body).toString('base64') : body,
    isBase64Encoded: base64,
    headers: { 'stripe-signature': signature },
  });
};

const run = (event: ReturnType<typeof makeEvent>) =>
  handler(event, {} as never) as Promise<HandlerResult>;

let store: FakeBlobStore;

beforeEach(() => {
  vi.stubEnv('STRIPE_WEBHOOK_SECRET', WEBHOOK_SECRET);
  store = createFakeBlobStore();
  getBlobStore.mockReturnValue(store);
  getStripeClient.mockReturnValue(stripe);
  submitToNetlifyForms.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe('stripe-webhook', () => {
  it('rejects non-POST methods', async () => {
    expect((await run(makeEvent({ httpMethod: 'GET' }))).statusCode).toBe(405);
  });

  it('rejects a request without a signature', async () => {
    expect((await run(makeEvent({ body: '{}' }))).statusCode).toBe(400);
  });

  it('rejects when the webhook secret is not configured', async () => {
    const event = signedEvent(stripeEvent());
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', '');

    expect((await run(event)).statusCode).toBe(400);
  });

  it('returns 500 when Stripe is not configured', async () => {
    getStripeClient.mockReturnValue(null);

    expect((await run(signedEvent(stripeEvent()))).statusCode).toBe(500);
  });

  it('rejects a payload signed with another secret', async () => {
    const result = await run(signedEvent(stripeEvent(), { secret: 'whsec_attacker' }));

    expect(result.statusCode).toBe(400);
    expect(result.body).toBe('Webhook signature verification failed');
    expect(submitToNetlifyForms).not.toHaveBeenCalled();
  });

  it('rejects a payload tampered with after signing', async () => {
    const event = signedEvent(stripeEvent());
    event.body = event.body!.replace('growth', 'essential');

    expect((await run(event)).statusCode).toBe(400);
  });

  it('acknowledges other event types without side effects', async () => {
    const result = await run(signedEvent(stripeEvent('payment_intent.created')));

    expect(result.statusCode).toBe(200);
    expect(parseBody(result)).toEqual({ received: true });
    expect(submitToNetlifyForms).not.toHaveBeenCalled();
  });

  it('records a completed checkout as a signed purchase submission', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-26T12:00:00Z'));

    const result = await run(signedEvent(stripeEvent()));
    vi.useRealTimers();

    expect(result.statusCode).toBe(200);
    expect(submitToNetlifyForms).toHaveBeenCalledWith('purchase', {
      planSlug: 'growth',
      stripeSessionId: 'cs_test_1',
      amountTotal: '150000',
      currency: 'cad',
      customerEmail: 'buyer@example.com',
      timestamp: '2026-10-26T12:00:00.000Z',
      verificationToken: signPurchase('cs_test_1'),
    });
    expect(store.entries.has('evt_1')).toBe(true);
  });

  it('accepts base64-encoded bodies', async () => {
    const result = await run(signedEvent(stripeEvent(), { base64: true }));

    expect(result.statusCode).toBe(200);
    expect(submitToNetlifyForms).toHaveBeenCalledOnce();
  });

  it('processes a redelivered event only once', async () => {
    await run(signedEvent(stripeEvent()));
    const second = await run(signedEvent(stripeEvent()));

    expect(parseBody(second)).toEqual({ received: true, duplicate: true });
    expect(submitToNetlifyForms).toHaveBeenCalledOnce();
  });

  it('releases its claim and returns 500 so Stripe retries a failed submission', async () => {
    submitToNetlifyForms.mockRejectedValueOnce(new Error('forms down'));

    const first = await run(signedEvent(stripeEvent()));
    expect(first.statusCode).toBe(500);
    expect(store.entries.has('evt_1')).toBe(false);

    const retry = await run(signedEvent(stripeEvent()));
    expect(retry.statusCode).toBe(200);
    expect(submitToNetlifyForms).toHaveBeenCalledTimes(2);
  });
});
