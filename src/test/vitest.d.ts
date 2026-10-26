/* eslint-disable @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars, @typescript-eslint/no-empty-object-type */
// Module augmentation requires interfaces; this registers vitest-axe's matchers on `expect`.
import type { AxeMatchers } from 'vitest-axe/matchers';

declare module 'vitest' {
  interface Assertion<T = unknown> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
