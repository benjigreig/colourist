/**
 * @module playwright.config
 * Browser tests of the built site in Chromium, Firefox and WebKit (ADR 0004).
 *
 * Tests run against `vite preview` of the production build, served at `BASE_PATH` so they see
 * the same paths GitHub Pages serves. Build first (`npm run build`).
 */
import { defineConfig, devices } from '@playwright/test';

const port = 4173;
const basePath = process.env.BASE_PATH ?? '/';

export default defineConfig({
  testDir: 'apps/web/e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${port}${basePath}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: `npm run preview --workspace @colourist/web -- --port ${port} --strictPort`,
    url: `http://localhost:${port}${basePath}`,
    reuseExistingServer: !process.env.CI,
  },
});
