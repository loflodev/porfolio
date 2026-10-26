import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { signPurchase, verifyPurchaseSignature } from './purchase-signature';

const SESSION_ID = 'cs_test_123';

beforeEach(() => {
  vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test_secret');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('purchase signature', () => {
  it('is a deterministic hex HMAC', () => {
    expect(signPurchase(SESSION_ID)).toMatch(/^[0-9a-f]{64}$/);
    expect(signPurchase(SESSION_ID)).toBe(signPurchase(SESSION_ID));
    expect(signPurchase(SESSION_ID)).not.toBe(signPurchase('cs_test_other'));
  });

  it('verifies a token it signed', () => {
    expect(verifyPurchaseSignature(SESSION_ID, signPurchase(SESSION_ID))).toBe(true);
  });

  it('rejects a token for a different session', () => {
    expect(verifyPurchaseSignature(SESSION_ID, signPurchase('cs_test_other'))).toBe(false);
  });

  it('rejects empty, short and non-hex tokens without throwing', () => {
    expect(verifyPurchaseSignature(SESSION_ID, '')).toBe(false);
    expect(verifyPurchaseSignature(SESSION_ID, 'abcd')).toBe(false);
    expect(verifyPurchaseSignature(SESSION_ID, 'zz'.repeat(32))).toBe(false);
  });

  it('rejects everything when the secret is missing', () => {
    const token = signPurchase(SESSION_ID);
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', '');

    expect(verifyPurchaseSignature(SESSION_ID, token)).toBe(false);
  });

  it('rejects tokens signed with another secret', () => {
    const token = signPurchase(SESSION_ID);
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_rotated');

    expect(verifyPurchaseSignature(SESSION_ID, token)).toBe(false);
  });
});
