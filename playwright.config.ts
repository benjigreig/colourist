/**
 * @module playwright.config
 * Browser tests of the built site in Chromium, Firefox and WebKit (ADR 0004).
 *
 * Tests run against `vite preview` of the production build, served at `BASE_PATH` so they see
 * the same paths GitHub Pages serves. Build first (`npm run build`).
 */
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const port = 4173;
const basePath = process.env.BASE_PATH ?? '/';

/**
 * On macOS 27, Playwright's Firefox reads the installed Firefox's app-data folder, which macOS
 * now protects, so it exits with "Could not find profile folder" (microsoft/playwright#42768).
 * Giving it an empty home of its own avoids that. Fixed in Firefox 158; remove this once
 * Playwright 1.65 is installed.
 */
function firefoxLaunchOptions(): { env?: NodeJS.ProcessEnv } {
  if (process.platform !== 'darwin') return {};
  const home = join(tmpdir(), 'colourist-playwright-firefox-home');
  mkdirSync(home, { recursive: true });
  return { env: { ...process.env, CFFIXED_USER_HOME: home } };
}

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
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], launchOptions: firefoxLaunchOptions() },
    },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: `npm run preview --workspace @colourist/web -- --port ${port} --strictPort`,
    url: `http://localhost:${port}${basePath}`,
    reuseExistingServer: !process.env.CI,
  },
});
