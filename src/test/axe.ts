import { configureAxe } from 'vitest-axe';

// jsdom has no layout engine (so no contrast) and can't message into iframes (the map embed);
// the Playwright e2e axe run covers both in a real browser.
export const axe = configureAxe({
  iframes: false,
  rules: {
    'color-contrast': { enabled: false },
  },
});
