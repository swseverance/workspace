/// <reference types='vitest' />
import angular from '@analogjs/vite-plugin-angular';
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/libs/environment',
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [angular({ tsconfig: 'tsconfig.lib.json' })],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  test: {
    name: 'environment',
    watch: false,
    globals: true,
    passWithNoTests: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['src/test-setup.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/libs/environment',
      provider: 'v8' as const,
    },
  },
}));
