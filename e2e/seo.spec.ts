import { expect, test } from '@playwright/test';

import { EXPECTED_TITLES, INDEXABLE_PATHS, PATHS } from './routes';

const count = (html: string, pattern: RegExp) => html.match(pattern)?.length ?? 0;

// These read the raw HTML without running JavaScript: what crawlers and link-preview scrapers see.
test.describe('prerendered HTML', () => {
  for (const path of PATHS) {
    test(`${path} ships its own title, meta and content`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.status()).toBe(200);
      const html = await response.text();

      expect(html).toContain(`<title data-prerendered="">${EXPECTED_TITLES[path]}</title>`);
      expect(count(html, /<title data-prerendered/g)).toBe(1);
      expect(count(html, /name="description"/g)).toBe(1);
      expect(count(html, /property="og:title"/g)).toBe(1);
      expect(count(html, /<h1\b/g)).toBe(1);

      const indexable = INDEXABLE_PATHS.includes(path);
      expect(count(html, /rel="canonical"/g)).toBe(indexable ? 1 : 0);
      if (indexable) {
        expect(html).toContain(`rel="canonical" href="https://loflodev.com${path}"`);
      }
      expect(html).toContain(
        `name="robots" content="${indexable ? 'index, follow' : 'noindex, follow'}"`
      );
    });
  }

  test('navigation is crawlable without JavaScript', async ({ request }) => {
    const html = await (await request.get('/')).text();

    for (const path of PATHS) {
      expect(html).toContain(`href="${path}"`);
    }
  });

  test('the 404 page is noindex', async ({ request }) => {
    const html = await (await request.get('/404.html')).text();

    expect(html).toContain('Page not found');
    expect(html).toContain('name="robots" content="noindex, follow"');
  });

  test('sitemap lists exactly the indexable routes with lastmod', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

    expect(locs).toEqual(INDEXABLE_PATHS.map((path) => `https://loflodev.com${path}`));
    expect(count(xml, /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g)).toBe(INDEXABLE_PATHS.length);
  });

  test('robots.txt points at the sitemap', async ({ request }) => {
    expect(await (await request.get('/robots.txt')).text()).toContain(
      'Sitemap: https://loflodev.com/sitemap.xml'
    );
  });
});

test.describe('after hydration', () => {
  for (const path of PATHS) {
    test(`${path} keeps a single set of head tags`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(EXPECTED_TITLES[path]);

      await expect(page.locator('head title')).toHaveCount(1);
      await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
      await expect(page.locator('head link[rel="canonical"]')).toHaveCount(
        INDEXABLE_PATHS.includes(path) ? 1 : 0
      );
    });
  }

  test('client-side navigation swaps head tags instead of stacking them', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation').getByRole('link', { name: 'Resume' }).click();

    await expect(page).toHaveURL('/resume');
    await expect(page).toHaveTitle(EXPECTED_TITLES['/resume']);
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://loflodev.com/resume'
    );
    await expect(page.locator('head title')).toHaveCount(1);
  });
});
