import { DEFAULT_STATE_NUMBER, POSTS } from './app.constants';
import { getProjectPath, PROJECT_SLUGS } from './projectSlugs';

export type SiteRoute = {
  path: string;
  /** Sitemap priority, 0.0–1.0. */
  priority: number;
  /** Indexable routes get a canonical tag and a sitemap entry; others are noindex. */
  indexable: boolean;
};

// Single source of truth for the routes the build prerenders and the sitemap lists.
export const ROUTES: SiteRoute[] = [
  { path: '/', priority: 1.0, indexable: true },
  { path: '/resume', priority: 0.8, indexable: true },
  { path: '/portfolio', priority: 0.8, indexable: true },
  // The blog stays out of the index until it has posts, so search engines don't see an
  // empty page.
  { path: '/blog', priority: 0.7, indexable: POSTS.length > DEFAULT_STATE_NUMBER },
  { path: '/pricing', priority: 0.6, indexable: true },
  { path: '/contact', priority: 0.6, indexable: true },
  ...PROJECT_SLUGS.map((slug) => ({ path: getProjectPath(slug), priority: 0.5, indexable: true })),
];

export const isIndexable = (path: string): boolean =>
  ROUTES.find((route) => route.path === path)?.indexable ?? false;
