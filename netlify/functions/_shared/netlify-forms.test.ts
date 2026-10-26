import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { submitToNetlifyForms } from './netlify-forms';

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  vi.stubEnv('DEPLOY_PRIME_URL', 'https://loflodev.com');
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('submitToNetlifyForms', () => {
  it('posts a urlencoded body with form-name to the site root', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200 });

    await submitToNetlifyForms('purchase', { planSlug: 'growth', note: 'a&b=c' });

    expect(fetchMock).toHaveBeenCalledWith('https://loflodev.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'form-name=purchase&planSlug=growth&note=a%26b%3Dc',
    });
  });

  it('throws with the status when Netlify rejects the submission', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404 });

    await expect(submitToNetlifyForms('purchase', {})).rejects.toThrow(
      'Netlify Forms submission for "purchase" failed with status 404'
    );
  });
});
