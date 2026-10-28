/**
 * tests/functional/app-downloads.spec.ts
 *
 * Functional tests for Betaciety app download CTAs.
 * Verifies App Store and Google Play links are correct, present in both
 * hero and footer, and accessible across viewports.
 *
 * Note: "Get the App" is an <h4> heading element, not an <a> link.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

const APP_STORE_URL = 'https://apps.apple.com/us/app/betaciety/id1503601686';
const GOOGLE_PLAY_URL =
  'https://play.google.com/store/apps/details?id=com.betaciety.app';

test.describe('App Download CTAs @functional', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.waitForLoad();
  });

  // ── Link correctness ─────────────────────────────────────────────────────────

  test('App Store link points to the correct Apple App Store URL @functional', async ({
    homePage,
  }) => {
    const href = await homePage.getAppStoreHref();
    expect(href).toBe(APP_STORE_URL);
  });

  test('Google Play link points to the correct Play Store URL @functional', async ({
    homePage,
  }) => {
    const href = await homePage.getGooglePlayHref();
    expect(href).toBe(GOOGLE_PLAY_URL);
  });

  // ── Link multiplicity (hero + footer) ────────────────────────────────────────

  test('App Store links appear at least twice (hero and footer) @functional', async ({
    homePage,
  }) => {
    const count = await homePage.countAppStoreLinks();
    expect(
      count,
      'App Store link should appear in both the hero and the footer'
    ).toBeGreaterThanOrEqual(2);
  });

  test('Google Play links appear at least twice (hero and footer) @functional', async ({
    homePage,
  }) => {
    const count = await homePage.countGooglePlayLinks();
    expect(
      count,
      'Google Play link should appear in both the hero and the footer'
    ).toBeGreaterThanOrEqual(2);
  });

  // ── "Get the App" CTA ────────────────────────────────────────────────────────

  test('"Get the App" call-to-action heading is visible on the page @functional', async ({
    homePage,
  }) => {
    // "Get the App" is an <h4> heading, not an anchor link
    await expect(homePage.getAppCta).toBeVisible();
  });

  test('"Get the App" text appears in the page (header and/or footer section) @functional', async ({
    page,
  }) => {
    const elements = page.getByRole('heading', { name: /get the app/i });
    const count = await elements.count();
    expect(
      count,
      '"Get the App" heading should appear at least once on the page'
    ).toBeGreaterThanOrEqual(1);
  });

  // ── Download badge accessibility ──────────────────────────────────────────────

  test('App Store badge image has an alt attribute @functional', async ({ page }) => {
    const badge = page.locator('a[href*="apps.apple.com"] img').first();
    if (await badge.count() > 0) {
      const alt = await badge.getAttribute('alt');
      expect(alt, 'App Store badge image should have an alt attribute').not.toBeNull();
    }
  });

  test('Google Play badge image has an alt attribute @functional', async ({ page }) => {
    const badge = page.locator('a[href*="play.google.com"] img').first();
    if (await badge.count() > 0) {
      const alt = await badge.getAttribute('alt');
      expect(alt, 'Google Play badge image should have an alt attribute').not.toBeNull();
    }
  });

  // ── Responsive visibility ────────────────────────────────────────────────────

  test('download badges are visible at mobile viewport @functional', async ({
    page,
    siteConfig,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-chrome', 'Runs only in the "mobile-chrome" project');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    await expect(
      page.locator('a[href*="apps.apple.com"]').first()
    ).toBeVisible();
    await expect(
      page.locator('a[href*="play.google.com"]').first()
    ).toBeVisible();
  });
});
