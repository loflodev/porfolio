import { ROUTES } from '../src/constants/routes';

export const PATHS = ROUTES.map((route) => route.path);
export const INDEXABLE_PATHS = ROUTES.filter((route) => route.indexable).map((route) => route.path);

export const EXPECTED_TITLES: Record<string, string> = {
  '/': 'Louis Florival — Full Stack Developer | LofloDev',
  '/resume': 'Resume | LofloDev',
  '/portfolio': 'Portfolio | LofloDev',
  '/blog': 'Blog | LofloDev',
  '/pricing': 'Pricing | LofloDev',
  '/contact': 'Contact | LofloDev',
};
