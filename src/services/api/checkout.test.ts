import { AxiosError, type AxiosResponse } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';

import axiosInstance from './axiosInstance';
import { createCheckoutSession, verifyCheckoutSession } from './checkout';

vi.mock('./axiosInstance', () => ({ default: { post: vi.fn(), get: vi.fn() } }));

const post = vi.mocked(axiosInstance.post);
const get = vi.mocked(axiosInstance.get);
const KEY = '0b8f7c9e-1a2b-4c3d-8e9f-0a1b2c3d4e5f';

afterEach(() => {
  vi.resetAllMocks();
});

describe('createCheckoutSession', () => {
  it('sends the plan, locale and idempotency key', async () => {
    post.mockResolvedValue({ data: { success: true, url: 'https://checkout.stripe.com/x' } });

    expect(await createCheckoutSession('growth', KEY, 'fr')).toEqual({
      success: true,
      url: 'https://checkout.stripe.com/x',
    });
    expect(post).toHaveBeenCalledWith(
      '/.netlify/functions/create-checkout-session',
      { plan: 'growth', locale: 'fr' },
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-Idempotency-Key': KEY }),
      })
    );
  });

  it('fails when the response has no url', async () => {
    post.mockResolvedValue({ data: { success: true } });

    expect(await createCheckoutSession('growth', KEY, 'en')).toEqual({
      success: false,
      error: 'Unable to start checkout',
    });
  });

  it('uses the server error message from a failed response', async () => {
    const error = new AxiosError('Request failed', '429', undefined, undefined, {
      data: { success: false, error: 'Too many requests' },
    } as AxiosResponse);
    post.mockRejectedValue(error);

    expect(await createCheckoutSession('growth', KEY, 'en')).toEqual({
      success: false,
      error: 'Too many requests',
    });
  });

  it('falls back to a generic message for non-axios errors', async () => {
    post.mockRejectedValue(new Error('boom'));

    expect((await createCheckoutSession('growth', KEY, 'en')).success).toBe(false);
  });
});

describe('verifyCheckoutSession', () => {
  it('returns true only for an explicit verified response', async () => {
    get.mockResolvedValueOnce({ data: { verified: true } });
    get.mockResolvedValueOnce({ data: { verified: 'yes' } });

    expect(await verifyCheckoutSession('cs_test_1')).toBe(true);
    expect(await verifyCheckoutSession('cs_test_1')).toBe(false);
    expect(get).toHaveBeenCalledWith('/.netlify/functions/verify-checkout-session', {
      params: { session_id: 'cs_test_1' },
      timeout: 10000,
    });
  });

  it('returns false on network errors', async () => {
    get.mockRejectedValue(new Error('offline'));

    expect(await verifyCheckoutSession('cs_test_1')).toBe(false);
  });
});
