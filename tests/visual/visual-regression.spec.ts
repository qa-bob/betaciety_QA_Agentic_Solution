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
 * Each test runs only in the Playwright project whose viewport it targets, and
 * is skipped (not failed) until a baseline has been captured for it.
 *
 * Tag: @visual
 */

import * as fs from 'fs';
import type { TestInfo } from '@playwright/test';
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
  await page.goto(url, { waitUntil: 'load' });
  await dismissCookieBanner(page);
  await freezeAnimations(page);
  await waitForImagesLoaded(page);
  // Reset scroll to top so viewport captures are consistent across runs
  await page.evaluate(() => window.scrollTo(0, 0));
}

/**
 * Skip unless running in `project`, and skip (not fail) until a baseline exists.
 * Only `--update-snapshots` (all/changed) should create a missing baseline.
 */
function skipUnlessBaseline(testInfo: TestInfo, project: string, snapshot: string): void {
  test.skip(testInfo.project.name !== project, `Runs only in the "${project}" project`);
  const isUpdating = ['all', 'changed'].includes(testInfo.config.updateSnapshots);
  const baselinePath = testInfo.snapshotPath(snapshot, { kind: 'screenshot' });
  test.skip(
    !isUpdating && !fs.existsSync(baselinePath),
    `No baseline at ${baselinePath} — run "npm run baseline" to capture one`
  );
}

test.describe('Visual Regression @visual', () => {
  test.beforeEach(async ({ siteConfig }) => {
    if (siteConfig.skipVisual) {
      test.skip(true, `Visual regression skipped for "${siteConfig.name}" (skipVisual: true)`);
    }
  });

  // ── Homepage ─────────────────────────────────────────────────────────────────

  test('homepage visual regression - desktop @visual', async ({ page, siteConfig }, testInfo) => {
    skipUnlessBaseline(testInfo, 'chromium-desktop', 'homepage-desktop.png');

    await page.setViewportSize({ width: 1280, height: 720 });
    await stabilise(page, siteConfig.url);
    await expect(page).toHaveScreenshot('homepage-desktop.png', { ...HOMEPAGE_OPTIONS });
  });

  test('homepage visual regression - mobile @visual', async ({ page, siteConfig }, testInfo) => {
    skipUnlessBaseline(testInfo, 'mobile-chrome', 'homepage-mobile.png');

    await page.setViewportSize({ width: 390, height: 844 });
    await stabilise(page, siteConfig.url);
    await expect(page).toHaveScreenshot('homepage-mobile.png', { ...HOMEPAGE_OPTIONS });
  });

  test('homepage visual regression - tablet @visual', async ({ page, siteConfig }, testInfo) => {
    skipUnlessBaseline(testInfo, 'tablet', 'homepage-tablet.png');

    await page.setViewportSize({ width: 768, height: 1024 });
    await stabilise(page, siteConfig.url);
    await expect(page).toHaveScreenshot('homepage-tablet.png', { ...HOMEPAGE_OPTIONS });
  });

  // ── Legal pages ───────────────────────────────────────────────────────────────

  test('Privacy Policy page visual regression - desktop @visual', async ({
    page,
    siteConfig,
  }, testInfo) => {
    skipUnlessBaseline(testInfo, 'chromium-desktop', 'privacy-policy-desktop.png');

    await page.setViewportSize({ width: 1280, height: 720 });
    await stabilise(page, `${siteConfig.url.replace(/\/$/, '')}/privacy-policy/`);
    await expect(page).toHaveScreenshot('privacy-policy-desktop.png', { ...LEGAL_OPTIONS });
  });

  test('Terms of Service page visual regression - desktop @visual', async ({
    page,
    siteConfig,
  }, testInfo) => {
    skipUnlessBaseline(testInfo, 'chromium-desktop', 'terms-of-service-desktop.png');

    await page.setViewportSize({ width: 1280, height: 720 });
    await stabilise(page, `${siteConfig.url.replace(/\/$/, '')}/terms-of-service/`);
    await expect(page).toHaveScreenshot('terms-of-service-desktop.png', { ...LEGAL_OPTIONS });
  });
});
