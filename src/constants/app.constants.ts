/* eslint-disable sonarjs/no-duplicate-string */
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

export const POSTS: PostType[] = [
  {
    to: '#',
    image: '/src/assets/images/blog-1.jpg',
    alt: 'Design conferences in 2022',
    meta: { category: 'Design', date: 'Fab 23, 2022' },
    title: 'Design conferences in 2022',
    description: 'Veritatis et quasi architecto beatae vitae dicta sunt, explicabo.',
  },
  {
    to: '#',
    image: '/src/assets/images/blog-2.jpg',
    alt: 'Best fonts every designer',
    meta: { category: 'Design', date: 'Fab 23, 2022' },
    title: 'Best fonts every designer',
    description: 'Sed ut perspiciatis, nam libero tempore, cum soluta nobis est eligendi.',
  },
  {
    to: '#',
    image: '/src/assets/images/blog-3.jpg',
    alt: 'Design digest #80',
    meta: { category: 'Design', date: 'Fab 23, 2022' },
    title: 'Design digest #80',
    description:
      'Excepteur sint occaecat cupidatat no proident, quis nostrum exercitationem ullam corporis suscipit.',
  },
  {
    to: '#',
    image: '/src/assets/images/blog-4.jpg',
    alt: 'UI interactions of the week',
    meta: { category: 'Design', date: 'Fab 23, 2022' },
    title: 'UI interactions of the week',
    description:
      'Enim ad minim veniam, consectetur adipiscing elit, quis nostrud exercitation ullamco laboris nisi.',
  },
  {
    to: '#',
    image: '/src/assets/images/blog-5.jpg',
    alt: 'The forgotten art of spacing',
    meta: { category: 'Design', date: 'Fab 23, 2022' },
    title: 'The forgotten art of spacing',
    description:
      'Maxime placeat, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    to: '#',
    image: '/src/assets/images/blog-6.jpg',
    alt: 'Design digest #79',
    meta: { category: 'Design', date: 'Fab 23, 2022' },
    title: 'Design digest #79',
    description: 'Optio cumque nihil impedit uo minus quod maxime placeat, velit esse cillum.',
  },
];

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
