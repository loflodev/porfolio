/* eslint-disable node/no-process-env */

// On Netlify, `URL` is always the production site URL, even on branch/preview deploys.
// `DEPLOY_PRIME_URL` is the URL of the deploy actually serving the request, so it must be
// preferred to keep checkout redirects and server-to-server calls on the right deploy.
export const resolveSiteUrl = (): string =>
  process.env.DEPLOY_PRIME_URL || process.env.URL || 'http://localhost:8888';
