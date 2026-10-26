import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { PATHS } from './routes';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const path of PATHS) {
  test(`${path} has no WCAG 2.2 AA violations`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      // Third-party embed we don't control.
      .exclude('iframe[src*="google.com/maps"]')
      .analyze();

    expect(results.violations).toEqual([]);
  });
}

test('an open dialog has no violations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Guise S' }).click();
  await expect(page.getByRole('dialog', { name: 'Guise S' })).toBeVisible();

  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

  expect(results.violations).toEqual([]);
});
