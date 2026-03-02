import logoColor2 from '@/assets/images/logo-2-color.png';
import logoAssurelis from '@/assets/images/logo-assurelis.png';
import logoBoissonsolutionx from '@/assets/images/logo-boissonsolutionx.png';
import logoJdpetplace from '@/assets/images/logo-jdpetplace.png';
import logoSafrozen from '@/assets/images/logo-safrozen.svg';

import type { ClientSectionType, ContactFormInputType, PostType } from '../types';

export const DEFAULT_STATE_NUMBER = 0;
export const INPUT_MININUM_CHARATER = 3;

// Input length limits (must match backend)
export const MAX_NAME_LENGTH = 100;
export const MAX_EMAIL_LENGTH = 254;
export const MAX_MESSAGE_LENGTH = 5000;

export const CLIENTS: ClientSectionType[] = [
  {
    to: 'https://safrozen.com/',
    image: logoSafrozen,
    alt: 'Les Aliments Safrozen Foods',
  },
  {
    to: 'https://boissonsolutionx.ca/',
    image: logoBoissonsolutionx,
    alt: 'Boisson SolutionX',
  },
  {
    to: '#',
    image: logoAssurelis,
    alt: 'Assurelis',
  },
  {
    to: 'https://jdpetplace.com/',
    image: logoJdpetplace,
    alt: '',
  },
  {
    to: '#',
    image: logoColor2,
    alt: '',
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
