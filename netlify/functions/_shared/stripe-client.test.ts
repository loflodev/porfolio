import { afterEach, describe, expect, it, vi } from 'vitest';

// The client is cached in module state, so each scenario gets a fresh copy.
const loadClient = async () => {
  vi.resetModules();
  return import('./stripe-client');
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getStripeClient', () => {
  it('returns null instead of throwing when the secret key is missing', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', '');
    const { getStripeClient } = await loadClient();

    expect(getStripeClient()).toBeNull();
  });

  it('creates the client once and reuses it', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_dummy');
    const { getStripeClient } = await loadClient();

    const client = getStripeClient();

    expect(client).not.toBeNull();
    expect(getStripeClient()).toBe(client);
  });
});
