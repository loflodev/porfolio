import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { makeEvent, parseBody, type HandlerResult } from './_test/fakes';

const { isRateLimited, captureAndFlush, getStripeClient, createSession } = vi.hoisted(() => ({
  isRateLimited: vi.fn(),
  captureAndFlush: vi.fn(),
  getStripeClient: vi.fn(),
  createSession: vi.fn(),
}));

vi.mock('./_shared/rate-limit', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./_shared/rate-limit')>()),
  isRateLimited,
}));
vi.mock('./_shared/sentry', () => ({ initSentry: vi.fn(), captureAndFlush }));
vi.mock('./_shared/stripe-client', () => ({ getStripeClient }));

const VALID_UUID = '0b8f7c9e-1a2b-4c3d-8e9f-0a1b2c3d4e5f';

// Price IDs are read from env at module load, so env is stubbed before each fresh import.
const loadHandler = async (env: Record<string, string> = {}) => {
  vi.resetModules();
  vi.stubEnv('STRIPE_PRICE_ESSENTIAL', 'price_essential');
  vi.stubEnv('STRIPE_PRICE_GROWTH', 'price_growth');
  vi.stubEnv('DEPLOY_PRIME_URL', 'https://loflodev.com');
  for (const [key, value] of Object.entries(env)) {
    vi.stubEnv(key, value);
  }
  const { handler } = await import('./create-checkout-session');
  return (event = makeEvent()) => handler(event, {} as never) as Promise<HandlerResult>;
};

const post = (body: unknown, headers: Record<string, string> = {}) =>
  makeEvent({ httpMethod: 'POST', body: JSON.stringify(body), headers });

beforeEach(() => {
  isRateLimited.mockResolvedValue(false);
  createSession.mockResolvedValue({ url: 'https://checkout.stripe.com/c/pay/cs_test_1' });
  getStripeClient.mockReturnValue({ checkout: { sessions: { create: createSession } } });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe('create-checkout-session', () => {
  it('answers CORS preflight', async () => {
    const run = await loadHandler();
    const result = await run(makeEvent({ httpMethod: 'OPTIONS' }));

    expect(result.statusCode).toBe(200);
    expect(result.headers?.['Access-Control-Allow-Methods']).toBe('POST, OPTIONS');
  });

  it('rejects non-POST methods', async () => {
    const run = await loadHandler();

    expect((await run(makeEvent({ httpMethod: 'GET' }))).statusCode).toBe(405);
  });

  it('returns 429 when the caller is rate limited', async () => {
    isRateLimited.mockResolvedValue(true);
    const run = await loadHandler();
    const result = await run(post({ plan: 'growth' }, { 'x-nf-client-connection-ip': '1.2.3.4' }));

    expect(result.statusCode).toBe(429);
    expect(isRateLimited).toHaveBeenCalledWith('1.2.3.4');
    expect(createSession).not.toHaveBeenCalled();
  });

  it.each([{}, { plan: 'enterprise' }, { plan: 42 }])('rejects invalid plan %j', async (body) => {
    const run = await loadHandler();
    const result = await run(post(body));

    expect(result.statusCode).toBe(400);
    expect(parseBody(result)).toEqual({ success: false, error: 'Invalid plan' });
  });

  it('returns 500 on a malformed JSON body', async () => {
    const run = await loadHandler();
    const result = await run(makeEvent({ httpMethod: 'POST', body: '{not json' }));

    expect(result.statusCode).toBe(500);
    expect(captureAndFlush).toHaveBeenCalled();
  });

  it('reports a missing price env var', async () => {
    const run = await loadHandler({ STRIPE_PRICE_GROWTH: '' });
    const result = await run(post({ plan: 'growth' }));

    expect(result.statusCode).toBe(500);
    expect(captureAndFlush.mock.calls[0][0].message).toContain('Missing Stripe price env var');
  });

  it('reports a Product ID configured where a Price ID belongs', async () => {
    const run = await loadHandler({ STRIPE_PRICE_GROWTH: 'prod_abc' });
    const result = await run(post({ plan: 'growth' }));

    expect(result.statusCode).toBe(500);
    expect(captureAndFlush.mock.calls[0][0].message).toContain('looks like a Product ID');
  });

  it('reports a missing Stripe secret key', async () => {
    getStripeClient.mockReturnValue(null);
    const run = await loadHandler();
    const result = await run(post({ plan: 'growth' }));

    expect(result.statusCode).toBe(500);
    expect(captureAndFlush.mock.calls[0][0].message).toBe('Missing STRIPE_SECRET_KEY');
  });

  it('creates a payment session and returns its url', async () => {
    const run = await loadHandler();
    const result = await run(
      post({ plan: 'essential', locale: 'fr' }, { 'x-idempotency-key': VALID_UUID })
    );

    expect(result.statusCode).toBe(200);
    expect(parseBody(result)).toEqual({
      success: true,
      url: 'https://checkout.stripe.com/c/pay/cs_test_1',
    });
    expect(createSession).toHaveBeenCalledWith(
      {
        mode: 'payment',
        line_items: [{ price: 'price_essential', quantity: 1 }],
        success_url:
          'https://loflodev.com/pricing?checkout=success&session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'https://loflodev.com/pricing?checkout=cancelled',
        locale: 'fr',
        metadata: { plan: 'essential' },
        client_reference_id: VALID_UUID,
      },
      { idempotencyKey: VALID_UUID }
    );
  });

  it('ignores a malformed idempotency key and unsupported locale', async () => {
    const run = await loadHandler();
    await run(post({ plan: 'growth', locale: 'de' }, { 'x-idempotency-key': 'not-a-uuid' }));

    const [params, options] = createSession.mock.calls[0];
    expect(params.locale).toBe('auto');
    expect(params.client_reference_id).toBeUndefined();
    expect(options).toBeUndefined();
  });

  it('returns 500 when Stripe throws', async () => {
    const error = new Error('stripe down');
    createSession.mockRejectedValue(error);
    const run = await loadHandler();
    const result = await run(post({ plan: 'growth' }));

    expect(result.statusCode).toBe(500);
    expect(parseBody(result)).toEqual({ success: false, error: 'Unable to start checkout' });
    expect(captureAndFlush).toHaveBeenCalledWith(error);
  });

  it('returns 500 when Stripe returns a session without a url', async () => {
    createSession.mockResolvedValue({ url: null });
    const run = await loadHandler();

    expect((await run(post({ plan: 'growth' }))).statusCode).toBe(500);
  });
});
