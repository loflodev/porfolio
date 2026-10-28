import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { makeEvent, parseBody, type HandlerResult } from './fakes';

const { isRateLimited, captureAndFlush, getStripeClient, retrieveSession } = vi.hoisted(() => ({
  isRateLimited: vi.fn(),
  captureAndFlush: vi.fn(),
  getStripeClient: vi.fn(),
  retrieveSession: vi.fn(),
}));

vi.mock('../_shared/rate-limit', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../_shared/rate-limit')>()),
  isRateLimited,
}));
vi.mock('../_shared/sentry', () => ({ initSentry: vi.fn(), captureAndFlush }));
vi.mock('../_shared/stripe-client', () => ({ getStripeClient }));

const { handler } = await import('../verify-checkout-session');

const NOW_SECONDS = Date.parse('2026-10-26T12:00:00Z') / 1000;
const ONE_HOUR = 3600;
const ONE_DAY = 24 * ONE_HOUR;

const run = (event: ReturnType<typeof makeEvent>) =>
  handler(event, {} as never) as Promise<HandlerResult>;

const get = (sessionId?: string) =>
  makeEvent({
    httpMethod: 'GET',
    queryStringParameters: sessionId === undefined ? null : { session_id: sessionId },
  });

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW_SECONDS * 1000);
  isRateLimited.mockResolvedValue(false);
  getStripeClient.mockReturnValue({ checkout: { sessions: { retrieve: retrieveSession } } });
  retrieveSession.mockResolvedValue({
    payment_status: 'paid',
    created: NOW_SECONDS - ONE_HOUR,
    metadata: { plan: 'growth' },
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('verify-checkout-session', () => {
  it('answers CORS preflight with GET allowed', async () => {
    const result = await run(makeEvent({ httpMethod: 'OPTIONS' }));

    expect(result.statusCode).toBe(200);
    expect(result.headers?.['Access-Control-Allow-Methods']).toBe('GET, OPTIONS');
  });

  it('rejects non-GET methods', async () => {
    expect((await run(makeEvent({ httpMethod: 'POST' }))).statusCode).toBe(405);
  });

  it('returns 429 when rate limited', async () => {
    isRateLimited.mockResolvedValue(true);
    const result = await run(get('cs_test_1'));

    expect(result.statusCode).toBe(429);
    expect(isRateLimited).toHaveBeenCalledWith(
      expect.objectContaining({ httpMethod: 'GET' }),
      'verify-checkout-rate-limit'
    );
  });

  it.each([undefined, '', 'pi_123', 'garbage'])('does not verify session id %j', async (id) => {
    const result = await run(get(id));

    expect(parseBody(result)).toEqual({ verified: false });
    expect(retrieveSession).not.toHaveBeenCalled();
  });

  it('verifies a paid session younger than 24h', async () => {
    const result = await run(get('cs_test_1'));

    expect(result.statusCode).toBe(200);
    expect(parseBody(result)).toEqual({ verified: true, planSlug: 'growth' });
    expect(retrieveSession).toHaveBeenCalledWith('cs_test_1');
  });

  it('does not verify a paid session older than 24h', async () => {
    retrieveSession.mockResolvedValue({
      payment_status: 'paid',
      created: NOW_SECONDS - ONE_DAY - 1,
      metadata: { plan: 'growth' },
    });

    expect(parseBody(await run(get('cs_test_1'))).verified).toBe(false);
  });

  it('does not verify an unpaid session and tolerates missing metadata', async () => {
    retrieveSession.mockResolvedValue({ payment_status: 'unpaid', created: NOW_SECONDS });

    expect(parseBody(await run(get('cs_test_1')))).toEqual({ verified: false, planSlug: null });
  });

  it('does not verify when Stripe is not configured', async () => {
    getStripeClient.mockReturnValue(null);

    expect(parseBody(await run(get('cs_test_1')))).toEqual({ verified: false });
    expect(captureAndFlush).toHaveBeenCalled();
  });

  it('does not verify when Stripe throws', async () => {
    retrieveSession.mockRejectedValue(new Error('No such checkout.session'));

    expect(parseBody(await run(get('cs_test_1')))).toEqual({ verified: false });
    expect(captureAndFlush).toHaveBeenCalled();
  });
});
