import { AxiosError } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';

import axiosInstance from './axiosInstance';
import { saveContactForm } from './contactForm';

vi.mock('./axiosInstance', () => ({ default: { post: vi.fn() } }));

const post = vi.mocked(axiosInstance.post);

const FORM = { fullName: 'Ada', email: 'ada@example.com', yourMessage: 'Hi & bye', website: '' };

afterEach(() => {
  post.mockReset();
});

describe('saveContactForm', () => {
  it('posts the Netlify Forms urlencoded payload', async () => {
    post.mockResolvedValue({ status: 200 });

    expect(await saveContactForm(FORM)).toEqual({ success: true });
    expect(post).toHaveBeenCalledWith(
      '/',
      'form-name=contact&fullName=Ada&email=ada%40example.com&yourMessage=Hi+%26+bye&website=',
      expect.objectContaining({
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    );
  });

  it('fails on a non-2xx status', async () => {
    post.mockResolvedValue({ status: 302 });

    expect(await saveContactForm(FORM)).toEqual({
      success: false,
      error: 'Failed to submit form',
    });
  });

  it('surfaces axios error messages', async () => {
    post.mockRejectedValue(new AxiosError('timeout of 10000ms exceeded'));

    expect(await saveContactForm(FORM)).toEqual({
      success: false,
      error: 'timeout of 10000ms exceeded',
    });
  });

  it('falls back to a generic message for unknown errors', async () => {
    post.mockRejectedValue(new Error('boom'));

    expect(await saveContactForm(FORM)).toEqual({
      success: false,
      error: 'An unexpected error occured. Please try again',
    });
  });
});
