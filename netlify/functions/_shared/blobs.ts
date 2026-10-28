import { getStore, type Store } from '@netlify/blobs';
import type { HandlerEvent } from '@netlify/functions';

type LambdaBlobsContext = { url?: string; url_uncached?: string; token?: string };

// Lambda-style handlers (`Handler` from @netlify/functions, as every function here is) don't get
// Netlify Blobs configured from the environment: the credentials arrive base64-encoded in
// `event.blobs`. @netlify/blobs' connectLambda() reads them but drops `url_uncached`, which
// strongly consistent reads require, so the store is configured explicitly from the event.
const readLambdaContext = (event: HandlerEvent): LambdaBlobsContext => {
  const encoded = (event as HandlerEvent & { blobs?: string }).blobs;

  if (!encoded) {
    throw new Error('Netlify Blobs credentials are missing from the function event');
  }

  return JSON.parse(Buffer.from(encoded, 'base64').toString('utf8')) as LambdaBlobsContext;
};

export const getBlobStore = (name: string, event: HandlerEvent): Store => {
  const { url, url_uncached: uncachedUrl, token } = readLambdaContext(event);

  return getStore({
    name,
    // Strong reads always see the latest write, which the compare-and-swap writes rely on.
    consistency: 'strong',
    siteID: event.headers['x-nf-site-id'] ?? '',
    token: token ?? '',
    edgeURL: url,
    uncachedEdgeURL: uncachedUrl,
  });
};
