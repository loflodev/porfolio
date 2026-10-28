import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createFakeBlobStore,
  makeEvent,
  parseBody,
  type FakeBlobStore,
  type HandlerResult,
} from './fakes';
import { verifyConsultationSignature } from '../_shared/consultation-signature';

const { captureAndFlush, getBlobStore, isRateLimited, submitToNetlifyForms } = vi.hoisted(() => ({
  captureAndFlush: vi.fn(),
  getBlobStore: vi.fn(),
  isRateLimited: vi.fn(),
  submitToNetlifyForms: vi.fn(),
}));

vi.mock('../_shared/sentry', () => ({ initSentry: vi.fn(), captureAndFlush }));
vi.mock('../_shared/blobs', () => ({ getBlobStore }));
vi.mock('../_shared/netlify-forms', () => ({ submitToNetlifyForms }));
vi.mock('../_shared/rate-limit', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../_shared/rate-limit')>()),
  isRateLimited,
}));

const { handler } = await import('../book-consultation');

const REQUEST = {
  fullName: ' Ada Lovelace ',
  email: ' Ada@Example.com ',
  consultationDate: '2026-10-27',
  consultationTime: '09:00',
  website: '',
};

const book = (body: unknown = REQUEST, httpMethod = 'POST') =>
  handler(
    makeEvent({ httpMethod, body: typeof body === 'string' ? body : JSON.stringify(body) }),
    {} as never
  ) as Promise<HandlerResult>;

let store: FakeBlobStore;

beforeEach(() => {
  vi.useFakeTimers();
  // Monday 26 October 2026, 08:00 in Montreal.
  vi.setSystemTime(new Date('2026-10-26T12:00:00Z'));
  vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test_secret');
  store = createFakeBlobStore();
  getBlobStore.mockReturnValue(store);
  isRateLimited.mockResolvedValue(false);
  submitToNetlifyForms.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe('book-consultation', () => {
  it('reserves the slot and records a signed contact submission', async () => {
    const result = await book();

    expect(result.statusCode).toBe(200);
    expect(parseBody(result)).toEqual({ success: true });
    expect(Object.keys(store.entries.get('2026-10-27')?.data as object)).toEqual(['09:00']);

    const [formName, fields] = submitToNetlifyForms.mock.calls[0];
    expect(formName).toBe('contact');
    expect(fields).toMatchObject({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      subject: 'consultation',
      consultationDate: '2026-10-27',
      consultationTime: '09:00',
    });
    expect(
      verifyConsultationSignature(
        '2026-10-27',
        '09:00',
        'ada@example.com',
        fields.verificationToken
      )
    ).toBe(true);
  });

  it('answers 409 slotTaken when the slot is already booked', async () => {
    await book();
    const result = await book({ ...REQUEST, email: 'bob@example.com' });

    expect(result.statusCode).toBe(409);
    expect(parseBody(result).error).toBe('slotTaken');
    expect(submitToNetlifyForms).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['a weekend', { consultationDate: '2026-10-31' }],
    ['a slot too soon', { consultationDate: '2026-10-26', consultationTime: '09:00' }],
    ['an off-grid time', { consultationTime: '09:15' }],
    ['a missing name', { fullName: '  ' }],
    ['an invalid email', { email: 'not-an-email' }],
  ])('rejects %s with 400 and books nothing', async (_case, overrides) => {
    const result = await book({ ...REQUEST, ...overrides });

    expect(result.statusCode).toBe(400);
    expect(store.entries.size).toBe(0);
    expect(submitToNetlifyForms).not.toHaveBeenCalled();
  });

  it('rejects a body that is not JSON', async () => {
    expect((await book('not json')).statusCode).toBe(400);
  });

  it('pretends success to bots that fill the honeypot, booking nothing', async () => {
    const result = await book({ ...REQUEST, website: 'spam.example' });

    expect(parseBody(result)).toEqual({ success: true });
    expect(store.entries.size).toBe(0);
    expect(submitToNetlifyForms).not.toHaveBeenCalled();
  });

  it('frees the slot again when recording the booking fails', async () => {
    submitToNetlifyForms.mockRejectedValue(new Error('forms down'));

    const result = await book();

    expect(result.statusCode).toBe(502);
    expect(store.entries.get('2026-10-27')?.data).toEqual({});
    expect(captureAndFlush).toHaveBeenCalled();
  });

  it('rate limits callers and only accepts POST', async () => {
    expect((await book(REQUEST, 'GET')).statusCode).toBe(405);
    isRateLimited.mockResolvedValue(true);
    expect((await book()).statusCode).toBe(429);
  });
});
