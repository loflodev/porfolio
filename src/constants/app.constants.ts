export const DEFAULT_STATE_NUMBER = 0;
export const INPUT_MININUM_CHARATER = 3;

import type { ClientSectionType, ContactFormInputType, PostType } from '../types';

export const CLIENTS: ClientSectionType[] = [
  {
    to: 'https://safrozen.com/',
    image: '/src/assets/images/logo-safrozen.svg',
    alt: 'Les Aliments Safrozen Foods',
  },
  {
    to: 'https://boissonsolutionx.ca/',
    image: '/src/assets/images/logo-boissonsolutionx.png',
    alt: 'Boisson SolutionX',
  },
  {
    to: '#',
    image: '/src/assets/images/logo-assurelis.png',
    alt: 'Assurelis',
  },
  {
    to: 'https://jdpetplace.com/',
    image: '/src/assets/images/logo-jdpetplace.png',
    alt: '',
  },
  {
    to: '#',
    image: '/src/assets/images/logo-5-color.png',
    alt: '',
  },
];

export const POSTS: PostType[] = [];
export const CONTACT_FORM_DEFAULT: ContactFormInputType = {
  fullName: '',
  email: '',
  yourMessage: '',
  errorMessage: {
    fullName: '',
    email: '',
    yourMessage: '',
  },
};
