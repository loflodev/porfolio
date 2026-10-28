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

// Contact form subjects (must match backend: netlify/functions/submission-created.ts).
export const CONTACT_SUBJECTS = ['general', 'consultation', 'joinTeam', 'reportIssue'] as const;
export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];
export const DEFAULT_CONTACT_SUBJECT: ContactSubject = 'general';
export const CONSULTATION_SUBJECT: ContactSubject = 'consultation';

// Consultation booking rules shared with netlify/functions/_shared/consultation-slots.ts:
// times are Montreal local time, bookable from today up to this many days ahead.
export const CONSULTATION_TIME_ZONE = 'America/Toronto';
export const CONSULTATION_WINDOW_DAYS = 60;

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
];

export const POSTS: PostType[] = [];
export const CONTACT_FORM_DEFAULT: ContactFormInputType = {
  fullName: '',
  email: '',
  subject: DEFAULT_CONTACT_SUBJECT,
  yourMessage: '',
  consultationDate: '',
  consultationTime: '',
  website: '', // Honeypot - must remain empty
  errorMessage: {
    fullName: '',
    email: '',
    yourMessage: '',
    consultationDate: '',
    consultationTime: '',
  },
};
