/* eslint-disable sonarjs/no-duplicate-string */
export const DEFAULT_STATE_NUMBER = 0;
export const INPUT_MININUM_CHARATER = 3;

import type {
  ClientSectionType,
  ContactFormInputType,
  PortfolioType,
  PostType,
  SkillType,
  TimelineType,
} from '../types';

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

export const EDUCATION: TimelineType[] = [
  {
    title: 'Alterna Academy',
    time: '2022 — 2023',
    description:
      'Full Stack Development – React, Node.js, Express.js, MongoDB (frontend & backend integration)',
  },
  {
    title: 'Instituto Tecnológico de Las Américas ITLA',
    time: '2014 — 2016',
    description:
      'Website creation and management with Content Management Systems (CMS), including building, customizing, and maintaining user‑friendly sites.',
  },
  {
    title: 'Cisco Certified Network Associate (CCNA)',
    time: '2012 — 2014',
    description: 'Networking configuration, routing & switching, security, and troubleshooting',
  },
];

export const EXPERIRENCE: TimelineType[] = [
  {
    title: 'Project‑based developer',
    time: '2024 — Present',
    description:
      'Delivering tailored web solutions across diverse projects, from design to deployment. Skilled in adapting to client needs, integrating modern frameworks, and ensuring scalable, maintainable results',
  },
  {
    title: 'Full stack Developer - Productiviy',
    time: '2023 — 2024',
    description:
      'React developer crafting clean TypeScript code, with Axios for data and Gestalt + Figma for design.',
  },
  {
    title: 'Frontend Developer - CoolHunter Partner',
    time: '2022 - 2023',
    description:
      'Web developer using Vue.js for dynamic interfaces, Tailwind CSS for styling, TypeScript for clean code, Axios for data fetching, and Git for version control.',
  },
];

export const SKILLS: SkillType[] = [
  { title: 'Web develop', progress: '90', width: 'w-[90%]' },
  { title: 'Web design', progress: '70', width: 'w-[70%]' },
  { title: 'Branding', progress: '50', width: 'w-[50%]' },
  { title: 'Wordpress', progress: '90', width: 'w-[90%]' },
];

export const PORTFOLIO: PortfolioType[] = [
  {
    to: '#',
    image: '/src/assets/images/project-1.jpg',
    title: 'Finance',
    category: 'Web development',
    alt: 'finance',
  },
  {
    to: '#',
    image: '/src/assets/images/project-2.png',
    title: 'Orizon',
    category: 'Web development',
    alt: 'orizon',
  },
  {
    to: '#',
    image: '/src/assets/images/project-3.jpg',
    title: 'Orizon',
    category: 'Web design',
    alt: 'fundo',
  },
  {
    to: '#',
    image: '/src/assets/images/project-4.png',
    title: 'Brawlhalla',
    category: 'Applications',
    alt: 'brawlhalla',
  },
  {
    to: '#',
    image: '/src/assets/images/project-5.png',
    title: 'DSM.',
    category: 'Web design',
    alt: 'dsm.',
  },
  {
    to: '#',
    image: '/src/assets/images/project-6.png',
    title: 'MetaSpark',
    category: 'Web design',
    alt: 'metaspark',
  },
  {
    to: '#',
    image: '/src/assets/images/project-7.png',
    title: 'Summary',
    category: 'Web development',
    alt: 'summary',
  },
  {
    to: '#',
    image: '/src/assets/images/project-8.jpg',
    title: 'Task Manager',
    category: 'Applications',
    alt: 'task manager',
  },
  {
    to: '#',
    image: '/src/assets/images/project-9.png',
    title: 'Arrival',
    category: 'Applications',
    alt: 'Web development',
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
