import type { HandlerEvent } from '@netlify/functions';

type StoredEntry = { data: unknown; etag: string };
type SetOptions = { onlyIfNew?: boolean; onlyIfMatch?: string };

// In-memory stand-in for a Netlify Blobs store. Mirrors the conditional-write semantics the
// functions rely on: `onlyIfNew` fails if the key exists, `onlyIfMatch` fails on a stale etag.
export const createFakeBlobStore = () => {
  const entries = new Map<string, StoredEntry>();
  let etagCounter = 0;

  const nextEtag = () => {
    etagCounter += 1;
    return `etag-${etagCounter}`;
  };

  return {
    entries,
    getWithMetadata: async (key: string) => {
      const entry = entries.get(key);
      return entry ? { data: entry.data, etag: entry.etag, metadata: {} } : null;
    },
    setJSON: async (key: string, value: unknown, options: SetOptions = {}) => {
      const existing = entries.get(key);

      if (options.onlyIfNew && existing) {
        return { modified: false };
      }
      if (options.onlyIfMatch && existing?.etag !== options.onlyIfMatch) {
        return { modified: false };
      }

      const etag = nextEtag();
      entries.set(key, { data: value, etag });
      return { modified: true, etag };
    },
    list: async () => ({ blobs: [...entries.keys()].map((key) => ({ key })), directories: [] }),
    delete: async (key: string) => {
      entries.delete(key);
    },
  };
};

export type FakeBlobStore = ReturnType<typeof createFakeBlobStore>;

export const makeEvent = (overrides: Partial<HandlerEvent> = {}): HandlerEvent => ({
  rawUrl: 'http://localhost:8888/.netlify/functions/test',
  rawQuery: '',
  path: '/.netlify/functions/test',
  httpMethod: 'POST',
  headers: {},
  multiValueHeaders: {},
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  body: null,
  isBase64Encoded: false,
  ...overrides,
});

// Netlify's Handler type allows a void return; every handler here always returns a response.
export type HandlerResult = { statusCode: number; headers?: Record<string, string>; body?: string };

export const parseBody = (result: HandlerResult) => JSON.parse(result.body ?? '{}');
