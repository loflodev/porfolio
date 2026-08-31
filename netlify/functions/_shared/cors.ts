/* eslint-disable node/no-process-env */
import { DEFAULT_STATE_NUMBER } from '../../../src/constants/app.constants';

const ALLOWED_ORIGINS = ['https://loflodev.com', 'https://www.loflodev.com'];
const isDev = process.env.CONTEXT === 'dev' || process.env.NETLIFY_DEV === 'true';

const isWhitelistedOrigin = (origin?: string): boolean =>
  Boolean(origin && ALLOWED_ORIGINS.includes(origin));

const resolveAllowedOrigin = (origin?: string): string => {
  if (isDev) {
    return origin || '*';
  }
  if (isWhitelistedOrigin(origin)) {
    return origin as string;
  }
  return ALLOWED_ORIGINS[DEFAULT_STATE_NUMBER];
};

export const getHeaders = (origin?: string, methods = 'POST, OPTIONS'): Record<string, string> => ({
  'Access-Control-Allow-Origin': resolveAllowedOrigin(origin),
  'Access-Control-Allow-Headers': 'Content-Type, X-Idempotency-Key',
  'Access-Control-Allow-Methods': methods,
  'Content-Type': 'application/json',
});
