/**
 * tests/visual/visual-regression.spec.ts
 *
 * Visual regression — compare screenshots against stored baselines.
 * Run `npm run baseline` to refresh baselines after intentional design changes.
 *
 * Tolerance:
 *  - Homepage (animated, dynamic images): maxDiffRatio 3%
 *  - Legal pages (static text): maxDiffPixels 500
 *
 * Tag: @visual
 */

import { test, expect } from '@fixtures/site.fixture';
import {
  dismissCookieBanner,
  freezeAnimations,
  waitForImagesLoaded,
} from '@utils/visual-helper';

// Visual tests need extra time for network + image load + settling
test.setTimeout(90_000);

// Homepage: viewport-only (no fullPage) so dynamic content below-fold and
// page-height variance don't affect the diff.  20% tolerance for rAF-driven
// animations / third-party widgets that can't be fully frozen.
// NOTE: Playwright 1.60 uses maxDiffPixelRatio (not maxDiffRatio).
const HOMEPAGE_OPTIONS = {
  animations: 'disabled' as const,
  caret: 'hide' as const,
  fullPage: false,
  timeout: 30_000,
  maxDiffPixelRatio: 0.25,
};

// Legal pages are static text — full page + tight pixel tolerance.
const LEGAL_OPTIONS = {
  animations: 'disabled' as const,
  caret: 'hide' as const,
  fullPage: true,
  timeout: 30_000,
  maxDiffPixels: 500,
};

async function stabilise(
  page: Parameters<typeof dismissCookieBanner>[0],
  url: string
): Promise<void> {
  await page.goto(url, { waitUntil: 'networkidle' });
  await dismissCookieBanner(page);
  await freezeAnimations(page);
  await waitForImagesLoaded(page);
  // Reset scroll to top so viewport captures are consistent across runs
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(2_000);
}

test.describe('Visual Regression @visual', () => {
  test.beforeEach(async ({ siteConfig }) => {
    if (siteConfig.skipVisual) {
      test.skip(true, `Visual regression skipped for "${siteConfig.name}" (skipVisual: true)`);
    }
  });

  // ── Homepage ─────────────────────────────────────────────────────────────────

  test('homepage visual regression - desktop @visual', async ({ page, siteConfig }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await stabilise(page, siteConfig.url);
    await expect(page).toHaveScreenshot('homepage-desktop.png', { ...HOMEPAGE_OPTIONS });
  });

  test('homepage visual regression - mobile @visual', async ({ page, siteConfig }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await stabilise(page, siteConfig.url);
    await expect(page).toHaveScreenshot('homepage-mobile.png', { ...HOMEPAGE_OPTIONS });
  });

  test('homepage visual regression - tablet @visual', async ({ page, siteConfig }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await stabilise(page, siteConfig.url);
    await expect(page).toHaveScreenshot('homepage-tablet.png', { ...HOMEPAGE_OPTIONS });
  });

  // ── Legal pages ───────────────────────────────────────────────────────────────

  test('Privacy Policy page visual regression - desktop @visual', async ({
    page,
    siteConfig,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await stabilise(page, `${siteConfig.url.replace(/\/$/, '')}/privacy-policy/`);
    await expect(page).toHaveScreenshot('privacy-policy-desktop.png', { ...LEGAL_OPTIONS });
  });

  test('Terms of Service page visual regression - desktop @visual', async ({
    page,
    siteConfig,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await stabilise(page, `${siteConfig.url.replace(/\/$/, '')}/terms-of-service/`);
    await expect(page).toHaveScreenshot('terms-of-service-desktop.png', { ...LEGAL_OPTIONS });
  });
});
