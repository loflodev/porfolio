import { afterEach, describe, expect, it, vi } from 'vitest';

// `isDev` is captured at module load, so each scenario imports a fresh copy of the module.
const loadCors = async (env: Record<string, string>) => {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) {
    vi.stubEnv(key, value);
  }
  return import('./cors');
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getHeaders in production', () => {
  it.each(['https://loflodev.com', 'https://www.loflodev.com'])(
    'echoes whitelisted %s',
    async (origin) => {
      const { getHeaders } = await loadCors({ CONTEXT: 'production', NETLIFY_DEV: 'false' });

      expect(getHeaders(origin)['Access-Control-Allow-Origin']).toBe(origin);
    }
  );

  it('falls back to the primary domain for unknown or missing origins', async () => {
    const { getHeaders } = await loadCors({ CONTEXT: 'production', NETLIFY_DEV: 'false' });

    expect(getHeaders('https://evil.example')['Access-Control-Allow-Origin']).toBe(
      'https://loflodev.com'
    );
    expect(getHeaders()['Access-Control-Allow-Origin']).toBe('https://loflodev.com');
  });

  it('uses POST by default and accepts custom methods', async () => {
    const { getHeaders } = await loadCors({ CONTEXT: 'production', NETLIFY_DEV: 'false' });

    expect(getHeaders()['Access-Control-Allow-Methods']).toBe('POST, OPTIONS');
    expect(getHeaders(undefined, 'GET, OPTIONS')['Access-Control-Allow-Methods']).toBe(
      'GET, OPTIONS'
    );
    expect(getHeaders()['Access-Control-Allow-Headers']).toContain('X-Idempotency-Key');
  });
});

describe('getHeaders in dev', () => {
  it('echoes any origin, or * when none is sent', async () => {
    const { getHeaders } = await loadCors({ CONTEXT: 'dev' });

    expect(getHeaders('http://localhost:5173')['Access-Control-Allow-Origin']).toBe(
      'http://localhost:5173'
    );
    expect(getHeaders()['Access-Control-Allow-Origin']).toBe('*');
  });

  it('treats NETLIFY_DEV=true as dev', async () => {
    const { getHeaders } = await loadCors({ CONTEXT: 'production', NETLIFY_DEV: 'true' });

    expect(getHeaders('http://localhost:8888')['Access-Control-Allow-Origin']).toBe(
      'http://localhost:8888'
    );
  });
});
