import { afterEach, describe, expect, it, vi } from 'vitest';

import { resolveSiteUrl } from './site-url';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('resolveSiteUrl', () => {
  it('prefers DEPLOY_PRIME_URL over URL', () => {
    vi.stubEnv('DEPLOY_PRIME_URL', 'https://deploy-preview-1--loflodev.netlify.app');
    vi.stubEnv('URL', 'https://loflodev.com');

    expect(resolveSiteUrl()).toBe('https://deploy-preview-1--loflodev.netlify.app');
  });

  it('falls back to URL, then localhost', () => {
    vi.stubEnv('DEPLOY_PRIME_URL', '');
    vi.stubEnv('URL', 'https://loflodev.com');
    expect(resolveSiteUrl()).toBe('https://loflodev.com');

    vi.stubEnv('URL', '');
    expect(resolveSiteUrl()).toBe('http://localhost:8888');
  });
});
