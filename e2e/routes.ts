import { ROUTES } from '../src/constants/routes';

export const PATHS = ROUTES.map((route) => route.path);
// Top-level pages linked from somewhere other than the site navigation: Contact is reached from
// the Pricing page's consultation and plan CTAs.
export const OFF_NAV_PATHS: Record<string, string> = { '/contact': '/pricing' };
// Top-level pages, linked from the site navigation (project pages are linked from /portfolio).
export const NAV_PATHS = PATHS.filter(
  (path) => path.split('/').length === 2 && !(path in OFF_NAV_PATHS)
);
export const INDEXABLE_PATHS = ROUTES.filter((route) => route.indexable).map((route) => route.path);

export const EXPECTED_TITLES: Record<string, string> = {
  '/': 'Louis Florival — Full Stack Developer | LofloDev',
  '/resume': 'Resume | LofloDev',
  '/portfolio': 'Portfolio | LofloDev',
  '/blog': 'Blog | LofloDev',
  '/pricing': 'Pricing | LofloDev',
  '/contact': 'Contact | LofloDev',
  '/portfolio/boisson-solutionx': 'Boisson SolutionX | LofloDev',
  '/portfolio/assurelis': 'Assurelis | LofloDev',
  '/portfolio/izipey': 'Izipey | LofloDev',
  '/portfolio/qaitless': 'Qaitless | LofloDev',
  '/portfolio/safrozen-foods': 'Les Aliments Safrozen Foods | LofloDev',
};
