/* eslint-disable sonarjs/no-duplicate-string */
import type { CardType, ClientSectionType, PortfolioType, SkillType, TimelineType } from '../types';

export const DEFAULT_STATE_NUMBER = 0;

export const TOP_MENU = [
  {
    label: 'About',
    to: '/',
    index: false,
  },
  {
    label: 'Resume',
    to: '/resume',
    index: false,
  },
  {
    label: 'Portfolio',
    to: '/portfolio',
    index: false,
  },
  {
    label: 'Blog',
    to: '/blog',
    index: false,
  },
  {
    label: 'Contact',
    to: '/contact',
    index: false,
  },
];

export const SERVICES: CardType[] = [
  {
    alt: 'design icon',
    title: 'Web design',
    image: '/src/assets/images/icon-design.svg',
    description: 'The most modern and high-quality design made at a professional level.',
  },
  {
    alt: 'Web development icon',
    title: 'Web development',
    image: '/src/assets/images/icon-dev.svg',
    description: 'High-quality development of sites at the professional level.',
  },
  {
    alt: 'mobile app icon',
    title: 'Mobile apps',
    image: '/src/assets/images/icon-app.svg',
    description: 'Professional development of applications for iOS and Android.',
  },
  {
    alt: 'camera icon',
    title: 'Photography',
    image: '/src/assets/images/icon-photo.svg',
    description: 'I make high-quality photos of any category at a professional level.',
  },
];

export const TESTIMONIES: CardType[] = [
  {
    alt: 'Daniel lewis',
    title: 'Daniel lewis',
    image: '/src/assets/images/avatar-1.png',
    description: `Richard was hired to create a corporate identity. We were very pleased with the work done. She has a lot of experience and is very concerned about the needs of client. Lorem ipsum dolor sit amet, ullamcous cididt consectetur adipiscing elit, seds do et eiusmod tempor incididunt ut laborels dolore magnarels alia.`,
  },
  {
    alt: 'Jessica miller',
    title: 'Jessica miller',
    image: '/src/assets/images/avatar-2.png',
    description: `Richard was hired to create a corporate identity. We were very pleased with the
                  work done. She has a lot of experience and is very concerned about the needs of
                  client. Lorem ipsum dolor sit amet, ullamcous cididt consectetur adipiscing elit,
                  seds do et eiusmod tempor incididunt ut laborels dolore magnarels alia.`,
  },
  {
    alt: 'Emily evans',
    title: 'Emily evans',
    image: '/src/assets/images/avatar-3.png',
    description: `Richard was hired to create a corporate identity. We were very pleased with the
                  work done. She has a lot of experience and is very concerned about the needs of
                  client. Lorem ipsum dolor sit amet, ullamcous cididt consectetur adipiscing elit,
                  seds do et eiusmod tempor incididunt ut laborels dolore magnarels alia.`,
  },
  {
    alt: 'Henry william"',
    title: 'Henry william',
    image: '/src/assets/images/avatar-4.png',
    description: `Richard was hired to create a corporate identity. We were very pleased with the
                  work done. She has a lot of experience and is very concerned about the needs of
                  client. Lorem ipsum dolor sit amet, ullamcous cididt consectetur adipiscing elit,
                  seds do et eiusmod tempor incididunt ut laborels dolore magnarels alia.`,
  },
];

export const CLIENTS: ClientSectionType[] = [
  {
    to: '#',
    image: '/src/assets/images/logo-1-color.png',
    alt: '',
  },
  {
    to: '#',
    image: '/src/assets/images/logo-2-color.png',
    alt: '',
  },
  {
    to: '#',
    image: '/src/assets/images/logo-3-color.png',
    alt: '',
  },
  {
    to: '#',
    image: '/src/assets/images/logo-4-color.png',
    alt: '',
  },
  {
    to: '#',
    image: '/src/assets/images/logo-5-color.png',
    alt: '',
  },
  {
    to: '#',
    image: '/src/assets/images/logo-6-color.png',
    alt: '',
  },
];

export const EDUCATION: TimelineType[] = [
  {
    title: 'University school of the arts',
    time: '2007 — 2008',
    description:
      'Nemo enims ipsam voluptatem, blanditiis praesentium voluptum delenit atque corrupti, quos dolores et quas molestias exceptur.',
  },
  {
    title: 'New york academy of art',
    time: '2006 — 2007',
    description:
      'Ratione voluptatem sequi nesciunt, facere quisquams facere menda ossimus, omnis voluptas assumenda est omnis..',
  },
  {
    title: 'High school of art and design',
    time: '2002 — 2004',
    description:
      'Duis aute irure dolor in reprehenderit in voluptate, quila voluptas mag odit aut fugit, sed consequuntur magni dolores eos.',
  },
];

export const EXPERIRENCE: TimelineType[] = [
  {
    title: 'Creative director',
    time: '2015 — Present',
    description:
      'Nemo enim ipsam voluptatem blanditiis praesentium voluptum delenit atque corrupti, quos dolores et qvuas molestias exceptur.',
  },
  {
    title: 'Art director',
    time: '2013 — 2015',
    description:
      'Ratione voluptatem sequi nesciunt, facere quisquams facere menda ossimus, omnis voluptas assumenda est omnis..',
  },
  {
    title: 'Web designer',
    time: '2010 — 2013',
    description:
      'Duis aute irure dolor in reprehenderit in voluptate, quila voluptas mag odit aut fugit, sed consequuntur magni dolores eos.',
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
