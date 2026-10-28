import { describe, expect, it, vi } from 'vitest';

import { getBlobStore } from './blobs';
import { makeEvent } from '../_test/fakes';

const { getStore } = vi.hoisted(() => ({ getStore: vi.fn(() => ({ name: 'store' })) }));

vi.mock('@netlify/blobs', () => ({ getStore }));

// What Netlify (and `netlify dev`) put on a Lambda-style function event.
const lambdaEvent = (blobs?: object) => ({
  ...makeEvent({ headers: { 'x-nf-site-id': 'site_123' } }),
  ...(blobs && { blobs: Buffer.from(JSON.stringify(blobs)).toString('base64') }),
});

describe('getBlobStore', () => {
  it('opens a strongly consistent store from the credentials on the event', () => {
    const event = lambdaEvent({
      url: 'https://edge.example',
      url_uncached: 'https://uncached.example',
      token: 'tok_1',
      primary_region: 'us-east-2',
    });

    expect(getBlobStore('checkout-rate-limit', event)).toEqual({ name: 'store' });
    expect(getStore).toHaveBeenCalledWith({
      name: 'checkout-rate-limit',
      consistency: 'strong',
      siteID: 'site_123',
      token: 'tok_1',
      edgeURL: 'https://edge.example',
      // connectLambda() drops this one; without it every strong read throws.
      uncachedEdgeURL: 'https://uncached.example',
    });
  });

  it('fails loudly when the event carries no Blobs credentials', () => {
    expect(() => getBlobStore('checkout-rate-limit', lambdaEvent())).toThrow(
      'Netlify Blobs credentials are missing from the function event'
    );
  });
});
