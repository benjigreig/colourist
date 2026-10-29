/**
 * @module vitest.config
 * One Vitest run across every workspace (ADR 0004). Each workspace is its own project, so the
 * app's tests use its Vite and Svelte configuration and the packages run in plain Node.
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['packages/*', 'apps/web', 'scripts'],
    // The engine and rules have no tests until CLR-12 and CLR-7.
    passWithNoTests: true,
  },
});
