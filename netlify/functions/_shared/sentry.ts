/* eslint-disable node/no-process-env, no-console */
import * as Sentry from '@sentry/node';

const SENTRY_FLUSH_TIMEOUT_MS = 2000;

let initialized = false;

export const initSentry = (): void => {
  if (initialized || !process.env.SENTRY_DSN) {
    return;
  }

  Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0 });
  initialized = true;
};

export const captureAndFlush = async (error: unknown): Promise<void> => {
  console.error(error);
  Sentry.captureException(error);
  await Sentry.flush(SENTRY_FLUSH_TIMEOUT_MS);
};
