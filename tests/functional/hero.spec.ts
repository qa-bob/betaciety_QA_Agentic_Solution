/**
 * tests/functional/hero.spec.ts
 *
 * Functional tests for the Betaciety homepage hero section.
 *
 * Note: Use tag-level h1 locator — WP does not reliably expose ARIA heading
 * levels via role queries with level constraints.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Hero Section @functional', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.waitForLoad();
  });

  // ── Heading & copy ───────────────────────────────────────────────────────────

  test('hero H1 is visible with product discovery content @functional', async ({
    homePage,
  }) => {
    await expect(homePage.heroHeading).toBeVisible();
    const text = await homePage.getHeroHeadingText();
    // Site has two h1 elements in DOM; partial match is resilient to copy changes
    expect(text.toLowerCase()).toContain('product discovery');
  });

  test('hero subheading about product discovery is visible @functional', async ({
    homePage,
  }) => {
    await expect(homePage.heroSubheading).toBeVisible();
    const text = await homePage.heroSubheading.textContent();
    expect(text?.toLowerCase()).toContain('product discovery');
  });

  // ── Social proof ─────────────────────────────────────────────────────────────

  test('social proof "500+" user count is visible @functional', async ({ homePage }) => {
    await expect(homePage.socialProof).toBeVisible();
    const text = await homePage.socialProof.textContent();
    expect(text).toMatch(/500\+/);
  });

  // ── App download badges ───────────────────────────────────────────────────────

  test('Apple App Store badge is visible @functional', async ({ homePage }) => {
    await expect(homePage.appStoreLink).toBeVisible();
  });

  test('Google Play badge is visible @functional', async ({ homePage }) => {
    await expect(homePage.googlePlayLink).toBeVisible();
  });

  test('App Store badge links to the correct Apple App Store URL @functional', async ({
    homePage,
  }) => {
    const href = await homePage.getAppStoreHref();
    expect(href).toContain('apps.apple.com');
    expect(href).toContain('betaciety');
  });

  test('Google Play badge links to the correct Play Store URL @functional', async ({
    homePage,
  }) => {
    const href = await homePage.getGooglePlayHref();
    expect(href).toContain('play.google.com');
    expect(href).toContain('betaciety');
  });

  // ── Device mockup images ─────────────────────────────────────────────────────

  test('device mockup images (iPhone / Android) are present @functional', async ({
    page,
  }) => {
    const mockups = page.locator(
      'img[src*="iphone"], img[src*="android"], img[src*="mockup"], img[src*="bcity"]'
    );
    const count = await mockups.count();
    expect(count, 'At least one device mockup image should be present').toBeGreaterThan(0);
  });

  test('all images on the page have alt attributes @functional', async ({
    page,
    siteConfig,
  }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const missingAlt = await page.evaluate<string[]>(() =>
      Array.from(document.querySelectorAll('img'))
        .filter((img) => !img.hasAttribute('alt'))
        .map((img) => img.src || '[no src]')
    );
    if (missingAlt.length > 0) {
      console.warn(
        `[functional/hero] ${missingAlt.length} image(s) missing alt:\n` +
          missingAlt.map((s) => `  ${s}`).join('\n')
      );
    }
    expect(
      missingAlt.length,
      `${missingAlt.length} image(s) missing alt attribute (accessibility)`
    ).toBe(0);
  });
});
