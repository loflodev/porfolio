import { expect, test } from '@playwright/test';

import { PATHS } from './routes';

for (const path of PATHS) {
  test(`${path} loads without console errors or hydration warnings`, async ({ page }) => {
    const problems: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error' || message.text().includes('hydrat')) {
        problems.push(message.text());
      }
    });
    page.on('pageerror', (error) => problems.push(error.message));

    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.waitForLoadState('load');

    expect(problems).toEqual([]);
  });
}
