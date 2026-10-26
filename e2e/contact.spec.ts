import { expect, test } from '@playwright/test';

test('empty submit reports errors that are tied to their fields', async ({ page }) => {
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Send Message' }).click();

  for (const label of ['Full Name', 'Email', 'Your Message']) {
    const field = page.getByLabel(label);
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(field).toHaveAccessibleDescription('This field is required');
  }
});

test('a valid message is submitted to Netlify Forms and confirmed', async ({ page }) => {
  let submitted = '';
  await page.route('**/', async (route) => {
    if (route.request().method() !== 'POST') return route.fallback();
    submitted = route.request().postData() ?? '';
    return route.fulfill({ status: 200, body: '' });
  });

  await page.goto('/contact');
  await page.getByLabel('Full Name').fill('Ada Lovelace');
  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByLabel('Your Message').fill('I would like a website.');
  await page.getByRole('button', { name: 'Send Message' }).click();

  await expect(page.getByRole('dialog', { name: 'Message sent successfully!' })).toBeVisible();
  expect(new URLSearchParams(submitted).get('form-name')).toBe('contact');
  expect(new URLSearchParams(submitted).get('email')).toBe('ada@example.com');
  await expect(page.getByLabel('Full Name')).toHaveValue('');
});
