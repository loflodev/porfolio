/* eslint-disable node/no-process-env */

const LOCAL_DEV_URL = 'http://localhost:8888';

// On Netlify, `URL` is always the production site URL, even on branch/preview deploys.
// `DEPLOY_PRIME_URL` is the URL of the deploy actually serving the request, so it must be
// preferred to keep checkout redirects and server-to-server calls on the right deploy.
// Under `netlify dev`, though, DEPLOY_PRIME_URL is a made-up host built from the branch name
// (e.g. https://feat/x--site-name.netlify.app) while `URL` is the local server, so use `URL`.
export const resolveSiteUrl = (): string => {
  if (process.env.NETLIFY_DEV === 'true') {
    return process.env.URL || LOCAL_DEV_URL;
  }

  return process.env.DEPLOY_PRIME_URL || process.env.URL || LOCAL_DEV_URL;
};
