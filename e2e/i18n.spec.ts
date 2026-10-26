import { expect, test } from '@playwright/test';

test('a French visitor gets French content and <html lang="fr">', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('i18nextLng', 'fr'));
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('À propos de moi');
  await expect(page.getByRole('link', { name: 'Aller au contenu' })).toBeAttached();
  // The English prerendered head tags are replaced, not duplicated.
  await expect(page.locator('head title')).toHaveCount(1);
  await expect(page.locator('head meta[property="og:locale"]')).toHaveAttribute('content', 'fr_CA');
});

test('an English visitor keeps <html lang="en">', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('i18nextLng', 'en'));
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});
