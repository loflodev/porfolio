import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { makeEvent, type HandlerResult } from './fakes';
import { signPurchase } from '../_shared/purchase-signature';

const { captureAndFlush, sendEmail } = vi.hoisted(() => ({
  captureAndFlush: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock('../_shared/sentry', () => ({ initSentry: vi.fn(), captureAndFlush }));
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: sendEmail };
  },
}));

const { handler } = await import('../submission-created');

const run = (payload: unknown) =>
  handler(makeEvent({ body: JSON.stringify({ payload }) }), {} as never) as Promise<HandlerResult>;

const purchaseData = (overrides: Record<string, string> = {}) => ({
  planSlug: ' growth ',
  stripeSessionId: 'cs_test_1',
  amountTotal: '150000',
  currency: 'cad',
  customerEmail: ' Buyer@Example.com ',
  timestamp: '2026-10-26T12:00:00.000Z',
  verificationToken: signPurchase('cs_test_1'),
  ...overrides,
});

beforeEach(() => {
  vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test_secret');
  vi.stubEnv('ADMIN_EMAIL', 'admin@loflodev.com');
  sendEmail.mockResolvedValue({ id: 'email_1' });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe('submission-created: contact form', () => {
  it('emails the admin with trimmed, normalised fields', async () => {
    const result = await run({
      form_name: 'contact',
      data: { fullName: '  Ada  ', email: ' ADA@Example.com ', yourMessage: ' Hello ' },
    });

    expect(result.statusCode).toBe(200);
    const email = sendEmail.mock.calls[0][0];
    expect(email.to).toBe('admin@loflodev.com');
    expect(email.subject).toContain('Ada');
    expect(email.text).toContain('Email: ada@example.com');
    expect(email.text).toContain('Message: Hello');
  });

  it('escapes HTML in user input', async () => {
    await run({
      form_name: 'contact',
      data: { fullName: '<script>x</script>', email: 'a@b.co', yourMessage: `"&'` },
    });

    const { html } = sendEmail.mock.calls[0][0];
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;x&lt;/script&gt;');
    expect(html).toContain('&quot;&amp;&#039;');
  });
});

describe('submission-created: purchase form', () => {
  it('emails the admin about a verified purchase', async () => {
    await run({ form_name: 'purchase', data: purchaseData() });

    const email = sendEmail.mock.calls[0][0];
    expect(email.subject).toBe('New Purchase - growth');
    expect(email.text).toContain('Customer: buyer@example.com');
    expect(email.text).toContain('Amount: 150000 CAD');
  });

  it.each([
    ['a forged token', { verificationToken: 'ab'.repeat(32) }],
    ['a missing token', { verificationToken: '' }],
    ['a token for another session', { verificationToken: signPurchase('cs_test_other') }],
  ])('rejects %s without emailing', async (_label, overrides) => {
    const result = await run({ form_name: 'purchase', data: purchaseData(overrides) });

    expect(result.statusCode).toBe(200);
    expect(sendEmail).not.toHaveBeenCalled();
    expect(captureAndFlush.mock.calls[0][0].message).toContain('Rejected unverified purchase');
  });
});

describe('submission-created: failures', () => {
  it('reports a malformed body and still returns 200', async () => {
    const result = (await handler(makeEvent({ body: '{nope' }), {} as never)) as HandlerResult;

    expect(result.statusCode).toBe(200);
    expect(captureAndFlush).toHaveBeenCalled();
  });

  it('reports an email provider failure and still returns 200', async () => {
    const error = new Error('resend down');
    sendEmail.mockRejectedValue(error);

    const result = await run({
      form_name: 'contact',
      data: { fullName: 'Ada', email: 'a@b.co', yourMessage: 'Hi there' },
    });

    expect(result.statusCode).toBe(200);
    expect(captureAndFlush).toHaveBeenCalledWith(error);
  });
});
