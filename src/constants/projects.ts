import placeholder1200x800 from '@/assets/images/placeholders/placeholder-1200x800.svg';
import placeholder1600x900 from '@/assets/images/placeholders/placeholder-1600x900.svg';
import placeholder1920x1080 from '@/assets/images/placeholders/placeholder-1920x1080.svg';
import placeholder800x1000 from '@/assets/images/placeholders/placeholder-800x1000.svg';
import project5 from '@/assets/images/project-5.webp';
import project6 from '@/assets/images/project-6.webp';
import boissonHero from '@/assets/images/projects/boisson-solutionx/01-hero.webp';
import boissonProducts from '@/assets/images/projects/boisson-solutionx/02-products.webp';
import boissonAbout from '@/assets/images/projects/boisson-solutionx/03-about.webp';
import boissonLocations from '@/assets/images/projects/boisson-solutionx/04-locations.webp';
import boissonContact from '@/assets/images/projects/boisson-solutionx/05-contact.webp';
import boissonFooter from '@/assets/images/projects/boisson-solutionx/06-footer.webp';

import { type ProjectSlug } from './projectSlugs';
import type { GalleryImageType, PortfolioType } from '../types';

// Projects are stored with i18n keys for their category and case-study copy (`copyKey` →
// projects.<name>.summary / .description.p1…p4 in the locales); usePortfolio/useProjectDetail
// translate them. A project with section `screenshots` uses them as its gallery (the first one is
// also its cover); others show their cover then placeholders, and projects without a screenshot
// yet use a placeholder cover.
type ProjectSource = Omit<PortfolioType, 'category' | 'slug' | 'summary' | 'description'> & {
  slug: ProjectSlug;
  categoryKey: string;
  copyKey: string;
};

const CASE_STUDY_PARAGRAPHS = ['p1', 'p2', 'p3', 'p4'];

// Intrinsic size of the resized project screenshots; lets the browser reserve space before load.
export const PROJECT_IMAGE_WIDTH = 1024;
export const PROJECT_IMAGE_HEIGHT = 768;

// Image numbers shown to people start at 1.
const FIRST_IMAGE_NUMBER = 1;

const PLACEHOLDERS = [
  { src: placeholder1600x900, width: 1600, height: 900 },
  { src: placeholder1200x800, width: 1200, height: 800 },
  { src: placeholder800x1000, width: 800, height: 1000 },
  { src: placeholder1920x1080, width: 1920, height: 1080 },
];

// Width of the section screenshots (captured at 2x, resized for the gallery and lightbox).
const SCREENSHOT_WIDTH = 1600;

const placeholderGallery = (title: string, screenshot: string): GalleryImageType[] =>
  PLACEHOLDERS.filter((placeholder) => placeholder.src !== screenshot).map(
    (placeholder, index) => ({
      ...placeholder,
      alt: `${title} placeholder screenshot ${index + FIRST_IMAGE_NUMBER} (${placeholder.width} × ${placeholder.height})`,
    })
  );

const buildGallery = (title: string, screenshot: string): GalleryImageType[] => [
  {
    src: screenshot,
    alt: `${title} home page`,
    width: PROJECT_IMAGE_WIDTH,
    height: PROJECT_IMAGE_HEIGHT,
  },
  ...placeholderGallery(title, screenshot),
];

const project = ({
  screenshots,
  ...source
}: Omit<ProjectSource, 'gallery'> & { screenshots?: GalleryImageType[] }): ProjectSource => ({
  ...source,
  gallery: screenshots ?? buildGallery(source.title, source.image),
});

const BOISSON_SCREENSHOTS: GalleryImageType[] = [
  { src: boissonHero, alt: 'Boisson SolutionX hero section', height: 1000 },
  { src: boissonProducts, alt: 'Boisson SolutionX products section', height: 1122 },
  { src: boissonAbout, alt: 'Boisson SolutionX about section', height: 1184 },
  { src: boissonLocations, alt: 'Boisson SolutionX where to buy section', height: 799 },
  { src: boissonContact, alt: 'Boisson SolutionX contact form section', height: 1168 },
  { src: boissonFooter, alt: 'Boisson SolutionX footer', height: 318 },
].map((image) => ({ ...image, width: SCREENSHOT_WIDTH }));

export const PROJECTS: ProjectSource[] = [
  project({
    slug: 'boisson-solutionx',
    linkTo1: 'https://boissonsolutionx.ca',
    linkTo2: 'https://github.com/loflodev/react-boissonsolutionx',
    image: boissonHero,
    title: 'Boisson SolutionX',
    categoryKey: 'webDevelopment',
    copyKey: 'projects.boissonSolutionx',
    alt: 'Boisson SolutionX',
    stacks: [
      'React',
      'TypeScript',
      'Vite',
      'Tailwind CSS',
      'TanStack Query',
      'Headless WordPress',
      'WPGraphQL',
      'ACF',
    ],
    screenshots: BOISSON_SCREENSHOTS,
  }),
  project({
    slug: 'assurelis',
    linkTo1: 'https://assureli.ca',
    // Private repository.
    linkTo2: '#',
    image: project6,
    title: 'Assurelis',
    categoryKey: 'webDevelopment',
    copyKey: 'projects.assurelis',
    alt: 'Assurelis',
    stacks: [
      'React 19',
      'TypeScript',
      'TanStack Router',
      'Zustand',
      'Zod',
      'NestJS 11',
      'MongoDB',
      'Docker',
      'Playwright',
    ],
  }),
  project({
    slug: 'izipey',
    // Private repository; no public deployment yet.
    linkTo1: '#',
    linkTo2: '#',
    image: placeholder1200x800,
    title: 'Izipey',
    categoryKey: 'webDevelopment',
    copyKey: 'projects.izipey',
    alt: 'Izipey',
    stacks: ['NestJS 12', 'TypeScript', 'MongoDB', 'Zod', 'Pino', 'Vitest', 'Docker', 'Lefthook'],
  }),
  project({
    slug: 'qaitless',
    // Private repositories (API + client); no public deployment yet.
    linkTo1: '#',
    linkTo2: '#',
    image: placeholder1200x800,
    title: 'Qaitless',
    categoryKey: 'webDevelopment',
    copyKey: 'projects.qaitless',
    alt: 'Qaitless',
    stacks: [
      'React 19',
      'TypeScript',
      'Vite',
      'Tailwind CSS',
      'TanStack Query',
      'React Hook Form',
      'Zod',
      'NestJS 11',
      'MongoDB',
      'Docker',
    ],
  }),
  project({
    slug: 'safrozen-foods',
    linkTo1: 'https://safrozen.com/',
    linkTo2: '#',
    image: project5,
    title: 'Les Aliments Safrozen Foods',
    categoryKey: 'webDesign',
    copyKey: 'projects.safrozenFoods',
    alt: 'Les Aliments Safrozen Foods',
    stacks: ['Figma', 'WordPress', 'Elementor Pro', 'WooCommerce', 'SEO'],
  }),
];

export const getProjectBySlug = (slug: string | undefined): ProjectSource | undefined =>
  PROJECTS.find((item) => item.slug === slug);

export const translateProject = (
  { categoryKey, copyKey, ...source }: ProjectSource,
  t: (key: string) => string
): PortfolioType => ({
  ...source,
  category: t(categoryKey),
  summary: t(`${copyKey}.summary`),
  description: CASE_STUDY_PARAGRAPHS.map((paragraph) => t(`${copyKey}.description.${paragraph}`)),
});
