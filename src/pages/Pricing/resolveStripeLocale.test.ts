import { describe, expect, it } from 'vitest';

import { resolveStripeLocale } from './usePricing';

describe('resolveStripeLocale', () => {
  it.each([
    ['en', 'en'],
    ['fr-CA', 'fr'],
    ['es-419', 'es'],
    ['de-DE', 'auto'],
    ['', 'auto'],
  ])('%s -> %s', (language, expected) => {
    expect(resolveStripeLocale(language)).toBe(expected);
  });
});
