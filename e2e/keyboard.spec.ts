import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

test('the skip link is the first tab stop and moves focus to main', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');

  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();

  await page.keyboard.press('Enter');
  await expect(page.locator('main#main-content')).toBeFocused();
});

test('main navigation links are reachable and activate with Enter', async ({ page }) => {
  await page.goto('/');
  const resume = page.getByRole('navigation').getByRole('link', { name: 'Resume' });

  await resume.focus();
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL('/resume');
  await expect(resume).toHaveAttribute('aria-current', 'page');
});

test('the More menu works from the keyboard', async ({ page }) => {
  await page.goto('/');
  const more = page.getByRole('button', { name: 'More' });

  await more.focus();
  await page.keyboard.press('Enter');
  await expect(more).toHaveAttribute('aria-expanded', 'true');

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Contact' })).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(more).toHaveAttribute('aria-expanded', 'false');
  await expect(more).toBeFocused();
});

test('a testimonial opens as a modal dialog and returns focus on Escape', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Guise S' });

  await trigger.focus();
  await page.keyboard.press('Enter');

  const dialog = page.getByRole('dialog', { name: 'Guise S' });
  await expect(dialog).toBeVisible();
  // The page behind a modal dialog is inert: tabbing may leave for the browser UI (activeElement
  // falls back to <body>) but never lands on page content outside the dialog.
  for (let i = 0; i < 3; i += 1) {
    await page.keyboard.press('Tab');
    const focusStaysInDialog = await dialog.evaluate(
      (el) => el.contains(document.activeElement) || document.activeElement === document.body
    );
    expect(focusStaysInDialog).toBe(true);
  }

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('focused controls show a visible focus ring', async ({ page }) => {
  await page.goto('/contact');
  await page.getByLabel('Full Name').focus();

  const outline = await page
    .getByLabel('Full Name')
    .evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe('none');
});
