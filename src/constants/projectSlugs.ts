// Kept apart from projects.ts (which imports images) so ROUTES stays importable from Node,
// e.g. by the Playwright specs.
export const PROJECT_SLUGS = [
  'boisson-solutionx',
  'assurelis',
  'izipey',
  'qaitless',
  'safrozen-foods',
] as const;

export type ProjectSlug = (typeof PROJECT_SLUGS)[number];

export const getProjectPath = (slug: string): string => `/portfolio/${slug}`;
