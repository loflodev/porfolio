import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { signConsultation, verifyConsultationSignature } from './consultation-signature';
import { signPurchase } from './purchase-signature';

const ARGS = ['2026-10-27', '09:00', 'ada@example.com'] as const;

beforeEach(() => {
  vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test_secret');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('consultation signature', () => {
  it('verifies a token it signed', () => {
    expect(verifyConsultationSignature(...ARGS, signConsultation(...ARGS))).toBe(true);
  });

  it('rejects a token for another slot or email', () => {
    const token = signConsultation(...ARGS);

    expect(verifyConsultationSignature('2026-10-27', '09:30', ARGS[2], token)).toBe(false);
    expect(verifyConsultationSignature(ARGS[0], ARGS[1], 'eve@example.com', token)).toBe(false);
  });

  it('never accepts a purchase token', () => {
    expect(verifyConsultationSignature(...ARGS, signPurchase(`${ARGS[0]}T${ARGS[1]}`))).toBe(false);
  });

  it('rejects empty and malformed tokens, and everything without a secret', () => {
    const token = signConsultation(...ARGS);

    expect(verifyConsultationSignature(...ARGS, '')).toBe(false);
    expect(verifyConsultationSignature(...ARGS, 'zz'.repeat(32))).toBe(false);
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', '');
    expect(verifyConsultationSignature(...ARGS, token)).toBe(false);
  });
});
