import type { ClientSectionType, ContactFormInputType, PostType } from '../types';

export const DEFAULT_STATE_NUMBER = 0;
export const INPUT_MININUM_CHARATER = 3;

// Pricing plans backed by a real Stripe Checkout session (must match backend price env vars)
export const PLAN_SLUGS = ['essential', 'growth'] as const;
export type PlanSlug = (typeof PLAN_SLUGS)[number];

// Input length limits (must match backend)
export const MAX_NAME_LENGTH = 100;
export const MAX_EMAIL_LENGTH = 254;
export const MAX_MESSAGE_LENGTH = 5000;

// Client logos served from public folder
export const CLIENTS: ClientSectionType[] = [
  {
    to: 'https://safrozen.com/',
    image: '/images/logo-safrozen.svg',
    alt: 'Les Aliments Safrozen Foods',
  },
  {
    to: 'https://boissonsolutionx.ca/',
    image: '/images/logo-boissonsolutionx.png',
    alt: 'Boisson SolutionX',
  },
  {
    to: '#',
    image: '/images/logo-assurelis.png',
    alt: 'Assurelis',
  },
  {
    to: 'https://jdpetplace.com/',
    image: '/images/logo-jdpetplace.png',
    alt: 'JD Pet Place',
  },
  {
    to: '#',
    image: '/images/logo-2-color.png',
    alt: 'Client logo',
  },
];

export const POSTS: PostType[] = [];
export const CONTACT_FORM_DEFAULT: ContactFormInputType = {
  fullName: '',
  email: '',
  yourMessage: '',
  website: '', // Honeypot - must remain empty
  errorMessage: {
    fullName: '',
    email: '',
    yourMessage: '',
  },
};
