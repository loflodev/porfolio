import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const srcDir = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': srcDir,
    },
  },
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}', 'netlify/functions/**/*.ts'],
      exclude: ['**/*.test.{ts,tsx}', 'src/test/**', 'netlify/functions/_test/**', '**/*.d.ts'],
      reporter: ['text', 'html'],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'web',
          environment: 'jsdom',
          include: ['src/**/*.test.{ts,tsx}'],
          setupFiles: ['src/test/setup.ts'],
          css: false,
        },
      },
      {
        extends: true,
        test: {
          name: 'functions',
          environment: 'node',
          include: ['netlify/functions/**/*.test.ts'],
        },
      },
    ],
  },
});
