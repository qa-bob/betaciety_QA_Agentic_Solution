/**
 * tests/functional/features.spec.ts
 *
 * Functional tests for the "What You'll Do Here" features section.
 *
 * Note: The four feature descriptions ("Explore Real Reviews", etc.) are
 * embedded inside image files (bc1–bc4.png), not DOM text nodes.  Tests
 * therefore target the images by their src filename rather than by text.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Features Section @functional', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.waitForLoad();
  });

  // ── Section heading ──────────────────────────────────────────────────────────

  test('"What You\'ll Do Here" section heading is visible @functional', async ({
    homePage,
  }) => {
    await expect(homePage.featuresHeading).toBeVisible();
  });

  // ── Individual feature images ─────────────────────────────────────────────────
  // bc1–bc4 filenames correspond to the four feature cards in page order.

  test('"Explore Real Reviews" feature image (bc1) is present and visible @functional', async ({
    homePage,
  }) => {
    await expect(homePage.exploreReviewsItem).toBeVisible();
  });

  test('"Share Your Insights" feature image (bc2) is present and visible @functional', async ({
    homePage,
  }) => {
    await expect(homePage.shareInsightsItem).toBeVisible();
  });

  test('"Follow Trusted Voices" feature image (bc3) is present and visible @functional', async ({
    homePage,
  }) => {
    await expect(homePage.followVoicesItem).toBeVisible();
  });

  test('"Stay Immersed & Explore" feature image (bc4) is present and visible @functional', async ({
    homePage,
  }) => {
    await expect(homePage.stayImmersedItem).toBeVisible();
  });

  // ── Completeness ─────────────────────────────────────────────────────────────

  test('all 4 feature images are present on the page @functional', async ({ homePage }) => {
    const count = await homePage.countFeatureImages();
    expect(
      count,
      `Expected 4 feature images (bc1–bc4), found ${count}`
    ).toBe(4);
  });

  test('all 4 feature images are visible (not hidden) @functional', async ({ homePage }) => {
    const count = await homePage.allFeatureImages.count();
    for (let i = 0; i < count; i++) {
      await expect(homePage.allFeatureImages.nth(i)).toBeVisible();
    }
  });

  // ── Accessibility ─────────────────────────────────────────────────────────────

  test('feature images have alt attributes @functional', async ({ page }) => {
    const featureImages = page.locator(
      'img[src*="bc1"], img[src*="bc2"], img[src*="bc3"], img[src*="bc4"]'
    );
    const count = await featureImages.count();
    const missingAlt: number[] = [];

    for (let i = 0; i < count; i++) {
      const alt = await featureImages.nth(i).getAttribute('alt');
      if (alt === null) missingAlt.push(i + 1);
    }

    if (missingAlt.length > 0) {
      console.warn(
        `[functional/features] Feature images missing alt attribute: bc${missingAlt.join(', bc')}`
      );
    }
    expect(
      missingAlt.length,
      `${missingAlt.length} feature image(s) missing alt attribute`
    ).toBe(0);
  });
});
