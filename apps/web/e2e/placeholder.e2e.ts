import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** WCAG 2.1 AA plus axe's best-practice rules, as in the framework spike (ADR 0003). */
const axeTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];

/**
 * Opens the placeholder page and records every request it makes.
 * @param page The Playwright page to use.
 * @returns The URL of every request made while loading.
 */
async function openPlaceholder(page: Page): Promise<string[]> {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('colouri.st');
  return requests;
}

test.describe('placeholder page (CLR-1)', () => {
  test('Checklist: meets WCAG 2.1 AA in light and dark', async ({ page }) => {
    for (const colorScheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme });
      await openPlaceholder(page);
      const results = await new AxeBuilder({ page }).withTags(axeTags).analyze();
      expect(results.violations, `axe in ${colorScheme} mode`).toEqual([]);
    }
  });

  test('Checklist: reflows at 320 CSS pixels', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await openPlaceholder(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('Checklist: no requests leave the site, and no cookies are set', async ({
    page,
    context,
    baseURL,
  }) => {
    const requests = await openPlaceholder(page);
    await page.waitForLoadState('networkidle');
    const origin = new URL(baseURL ?? '').origin;
    expect(requests.filter((url) => new URL(url).origin !== origin)).toEqual([]);
    expect(await context.cookies()).toEqual([]);
  });
});
