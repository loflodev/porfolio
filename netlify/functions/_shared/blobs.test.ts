import { describe, expect, it, vi } from 'vitest';

import { getBlobStore } from './blobs';

const { getStore } = vi.hoisted(() => ({ getStore: vi.fn(() => ({ name: 'store' })) }));

vi.mock('@netlify/blobs', () => ({ getStore }));

describe('getBlobStore', () => {
  it('opens a strongly consistent store so conditional writes see the latest value', () => {
    expect(getBlobStore('checkout-rate-limit')).toEqual({ name: 'store' });
    expect(getStore).toHaveBeenCalledWith({ name: 'checkout-rate-limit', consistency: 'strong' });
  });
});
