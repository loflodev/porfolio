import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { init, captureException, flush } = vi.hoisted(() => ({
  init: vi.fn(),
  captureException: vi.fn(),
  flush: vi.fn(),
}));

vi.mock('@sentry/node', () => ({ init, captureException, flush }));

// `initialized` is module state, so each scenario gets a fresh copy.
const loadSentry = async () => {
  vi.resetModules();
  return import('./sentry');
};

const consoleError = vi.fn();

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(consoleError);
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('initSentry', () => {
  it('does nothing without a DSN', async () => {
    vi.stubEnv('SENTRY_DSN', '');
    const { initSentry } = await loadSentry();

    initSentry();

    expect(init).not.toHaveBeenCalled();
  });

  it('initialises once with the deploy context as environment', async () => {
    vi.stubEnv('SENTRY_DSN', 'https://key@sentry.example/1');
    vi.stubEnv('CONTEXT', 'deploy-preview');
    const { initSentry } = await loadSentry();

    initSentry();
    initSentry();

    expect(init).toHaveBeenCalledOnce();
    expect(init).toHaveBeenCalledWith({
      dsn: 'https://key@sentry.example/1',
      tracesSampleRate: 0,
      environment: 'deploy-preview',
    });
  });

  it('defaults the environment to production', async () => {
    vi.stubEnv('SENTRY_DSN', 'https://key@sentry.example/1');
    vi.stubEnv('CONTEXT', '');
    const { initSentry } = await loadSentry();

    initSentry();

    expect(init.mock.calls[0][0].environment).toBe('production');
  });
});

describe('captureAndFlush', () => {
  it('logs, captures and waits for the flush', async () => {
    const { captureAndFlush } = await loadSentry();
    const error = new Error('boom');

    await captureAndFlush(error);

    expect(consoleError).toHaveBeenCalledWith(error);
    expect(captureException).toHaveBeenCalledWith(error);
    expect(flush).toHaveBeenCalledWith(2000);
  });
});
