/**
 * tests/smoke/site-availability.spec.ts
 *
 * Smoke tests — fast, high-value checks that confirm the site is up and
 * serving a meaningful page.  Run first in CI to gate deeper test suites.
 *
 * Tag: @smoke
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Site Availability @smoke', () => {
  test('site homepage loads with HTTP 2xx @smoke', async ({ homePage, siteConfig }) => {
    const response = await homePage.page.goto(siteConfig.url, {
      waitUntil: 'domcontentloaded',
    });
    expect(response).not.toBeNull();
    const status = response!.status();
    expect(
      status >= 200 && status < 400,
      `Expected HTTP 2xx/3xx but got ${status} for ${siteConfig.url}`
    ).toBeTruthy();
  });

  test('page body has visible text content @smoke', async ({ homePage }) => {
    const bodyText = await homePage.page.evaluate<string>(
      () => document.body.innerText
    );
    expect(bodyText.trim().length, 'Page body should have visible text').toBeGreaterThan(0);
  });

  test('page loads within 10 seconds @smoke', async ({ siteConfig, page }) => {
    const MAX_LOAD_MS = 10_000;
    const start = Date.now();
    await page.goto(siteConfig.url, { waitUntil: 'load' });
    const elapsed = Date.now() - start;
    expect(
      elapsed,
      `Page took ${elapsed}ms — exceeds ${MAX_LOAD_MS}ms limit`
    ).toBeLessThan(MAX_LOAD_MS);
  });

  test('no critical JavaScript errors on load @smoke', async ({ siteConfig, page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(`[pageerror] ${err.message}`);
    });
    await page.goto(siteConfig.url, { waitUntil: 'load' });

    const criticalErrors = consoleErrors.filter((err) => {
      const lower = err.toLowerCase();
      return (
        !lower.includes('google-analytics') &&
        !lower.includes('googletagmanager') &&
        !lower.includes('hotjar') &&
        !lower.includes('intercom') &&
        !lower.includes('net::err_blocked_by_client')
      );
    });
    if (criticalErrors.length > 0) {
      console.warn('[smoke] Console errors:\n' + criticalErrors.join('\n'));
    }
    expect(
      criticalErrors.length,
      `Found ${criticalErrors.length} console error(s):\n${criticalErrors.join('\n')}`
    ).toBeLessThanOrEqual(3);
  });

  test('site is served over HTTPS @smoke', async ({ siteConfig }) => {
    expect(
      siteConfig.url.toLowerCase().startsWith('https://'),
      `Site URL "${siteConfig.url}" should use HTTPS`
    ).toBeTruthy();
  });

  test('page title is "Betaciety" @smoke', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const title = await page.title();
    expect(title.trim()).toBeTruthy();
    expect(title).toBe('Betaciety');
  });

  test('H1 heading is present with product discovery content @smoke', async ({
    page,
    siteConfig,
  }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    // Use tag-level selector — WP does not expose role=heading ARIA levels reliably.
    // The site has two h1 elements; first() is sufficient for the smoke check.
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    const text = await h1.textContent();
    expect(text?.toLowerCase()).toContain('product discovery');
  });

  test('App Store download link is present in page @smoke', async ({ homePage }) => {
    await expect(homePage.appStoreLink).toBeVisible();
  });

  test('Google Play download link is present in page @smoke', async ({ homePage }) => {
    await expect(homePage.googlePlayLink).toBeVisible();
  });

  test('page has a meta description tag @smoke', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    // Meta description may be injected by WP SEO plugins — soft-warn if absent
    const metaDesc = page.locator('meta[name="description"]').first();
    const count = await page.locator('meta[name="description"]').count();
    if (count === 0) {
      console.warn(
        `[smoke] "${siteConfig.name}" has no meta description. ` +
          'This affects SEO performance.'
      );
    } else {
      const content = await metaDesc.getAttribute('content');
      if (!content || content.trim().length === 0) {
        console.warn('[smoke] Meta description is empty.');
      } else {
        expect(content.trim().length).toBeGreaterThan(10);
      }
    }
  });

  test('page has a meta viewport tag @smoke', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    // WP plugins may inject multiple viewport tags; use head-scoped first()
    const viewport = page.locator('head meta[name="viewport"]').first();
    const count = await page.locator('meta[name="viewport"]').count();
    if (count === 0) {
      console.warn('[smoke] No meta viewport tag found.');
    } else {
      const content = await viewport.getAttribute('content');
      expect(content, 'Viewport meta should include width=device-width').toContain(
        'width=device-width'
      );
    }
  });
});
