// Bakes each route's HTML (and its <head> meta) into dist/ after `vite build`, so crawlers and
// link-preview scrapers that don't run JavaScript see real content and per-page tags.
// Run after both the client build (dist/) and the SSR build (dist-ssr/).
import { readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SSR_ENTRY = join(ROOT, 'dist-ssr', 'entry-server.js');
const SITE_URL = 'https://loflodev.com';
const NOT_FOUND_URL = '/__not-found__';
const ROOT_MARKUP = '<div id="root"></div>';

// React emits hoisted <title>/<meta>/<link> ahead of the app markup when rendering a
// fragment; peel that run off so it can be moved into <head>.
const HOISTED_RUN = /^(?:<title>[^<]*<\/title>|<(?:meta|link)\b[^>]*\/?>)*/;

const splitHoisted = (html) => {
  const [head] = html.match(HOISTED_RUN);
  // Mark tags so the browser entry can drop them if it re-renders instead of hydrating.
  const marked = head.replace(/<(title|meta|link)\b/g, '<$1 data-prerendered=""');
  return { head: marked, body: html.slice(head.length) };
};

const fillTemplate = (template, { head, body }) => {
  if (!template.includes(ROOT_MARKUP) || !template.includes('</head>')) {
    throw new Error('dist/index.html is missing <div id="root"></div> or </head>');
  }
  return template
    .replace('</head>', `${head}\n  </head>`)
    .replace(ROOT_MARKUP, `<div id="root">${body}</div>`);
};

// Flat files (resume.html) rather than folders (resume/index.html): Netlify and `vite preview`
// both serve /resume from resume.html without a trailing-slash redirect, matching the canonicals.
const outputPathFor = (route) =>
  route === '/' ? join(DIST, 'index.html') : join(DIST, `${route.slice(1)}.html`);

const buildSitemap = (routes, lastmod) => {
  const urls = routes
    .filter((route) => route.indexable)
    .map(
      (route) => `  <url>
    <loc>${SITE_URL}${route.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
};

const main = async () => {
  const { render, ROUTES } = await import(pathToFileURL(SSR_ENTRY).href);
  const template = await readFile(join(DIST, 'index.html'), 'utf8');

  for (const route of ROUTES) {
    await writeFile(outputPathFor(route.path), fillTemplate(template, splitHoisted(await render(route.path))));
  }

  // Netlify serves 404.html with a 404 status for any path without a file.
  await writeFile(
    join(DIST, '404.html'),
    fillTemplate(template, splitHoisted(await render(NOT_FOUND_URL)))
  );

  const lastmod = new Date().toISOString().slice(0, 10);
  await writeFile(join(DIST, 'sitemap.xml'), buildSitemap(ROUTES, lastmod));

  await rm(join(ROOT, 'dist-ssr'), { recursive: true, force: true });

  process.stdout.write(`prerendered ${ROUTES.length} routes + 404.html, sitemap.xml\n`);
};

await main();
