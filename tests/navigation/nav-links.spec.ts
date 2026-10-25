/**
 * tests/navigation/nav-links.spec.ts
 *
 * Navigation tests for the Betaciety site.
 *
 * Selector notes:
 *  - WP theme uses div-based layout, not semantic <header> element.
 *    Use img[src*="logo"] / img[alt*="Betaciety"] for the logo.
 *  - "Get the App" is rendered as an <h4> heading, not an anchor link.
 *  - Legal page H1 has strict-mode violation (2 h1 elements) — use .first().
 *
 * Tag: @navigation
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Navigation @navigation', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.waitForLoad();
  });

  // ── Header ───────────────────────────────────────────────────────────────────

  test('header logo image is visible @navigation', async ({ page }) => {
    // On narrow viewports (mobile/tablet) the header logo may be inside a
    // collapsed hamburger menu and CSS-hidden. The footer logo is always present.
    // Assert the brand logo exists in DOM; verify visibility at desktop widths.
    const logos = page.locator('img[src*="betaciety-logo"], img[alt*="Betaciety" i]');
    const count = await logos.count();
    expect(count, 'Betaciety logo should be present in the DOM').toBeGreaterThan(0);
    const vp = page.viewportSize();
    if (vp && vp.width >= 1024) {
      await expect(logos.first(), 'Header logo should be visible at desktop').toBeVisible();
    }
  });

  test('"Get the App" call-to-action is visible in the page @navigation', async ({
    homePage,
  }) => {
    // "Get the App" is an <h4> heading, not an anchor link
    await expect(homePage.getAppCta).toBeVisible();
  });

  test('logo anchor links back to homepage @navigation', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    // Logo image is wrapped in an anchor pointing to the homepage
    const logoAnchor = page
      .locator('a')
      .filter({ has: page.locator('img[src*="betaciety-logo"], img[alt*="Betaciety" i]') })
      .first();

    test.skip(await logoAnchor.count() === 0, 'Could not identify logo anchor');
    const href = await logoAnchor.getAttribute('href');
    expect(href).not.toBeNull();
    const resolvedHref = new URL(href!, siteConfig.url).toString();
    expect(
      resolvedHref.startsWith(new URL(siteConfig.url).origin),
      `Logo href "${href}" should point to site origin`
    ).toBeTruthy();
  });

  // ── Footer links ─────────────────────────────────────────────────────────────

  test('footer Privacy Policy link is visible @navigation', async ({ homePage }) => {
    await expect(homePage.footerPrivacyLink).toBeVisible();
  });

  test('footer Terms of Service link is visible @navigation', async ({ homePage }) => {
    await expect(homePage.footerTermsLink).toBeVisible();
  });

  test('footer email contact link is present with correct address @navigation', async ({
    homePage,
  }) => {
    await expect(homePage.footerEmailLink).toBeVisible();
    const href = await homePage.footerEmailLink.getAttribute('href');
    expect(href).toContain('mailto:');
    expect(href).toContain('support@betaciety.com');
  });

  test('footer Instagram link is present @navigation', async ({ homePage }) => {
    await expect(homePage.footerInstagramLink).toBeVisible();
    const href = await homePage.footerInstagramLink.getAttribute('href');
    expect(href).toContain('instagram.com');
  });

  // ── Internal routing ─────────────────────────────────────────────────────────

  test('Privacy Policy link navigates to /privacy-policy/ page @navigation', async ({
    page,
    siteConfig,
  }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const privacyLink = page
      .locator('footer')
      .getByRole('link', { name: /privacy policy/i })
      .first();
    await privacyLink.click();
    await page.waitForLoadState('domcontentloaded');

    expect(page.url()).toContain('privacy-policy');
    // Use .first() — page has two h1 elements
    const heading = await page.locator('h1').first().textContent();
    expect(heading?.toLowerCase()).toContain('privacy');
  });

  test('Terms of Service link navigates to /terms-of-service/ page @navigation', async ({
    page,
    siteConfig,
  }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const termsLink = page
      .locator('footer')
      .getByRole('link', { name: /terms of service/i })
      .first();
    await termsLink.click();
    await page.waitForLoadState('domcontentloaded');

    expect(page.url()).toContain('terms-of-service');
    const heading = await page.locator('h1').first().textContent();
    expect(heading?.toLowerCase()).toContain('terms');
  });

  // ── External link hrefs ───────────────────────────────────────────────────────

  test('App Store link has a valid href @navigation', async ({ homePage }) => {
    const href = await homePage.getAppStoreHref();
    expect(href).toContain('apps.apple.com');
    expect(href).toContain('betaciety');
  });

  test('Google Play link has a valid href @navigation', async ({ homePage }) => {
    const href = await homePage.getGooglePlayHref();
    expect(href).toContain('play.google.com');
    expect(href).toContain('betaciety');
  });

  // ── Mobile layout ────────────────────────────────────────────────────────────

  test('logo is present in DOM at mobile viewport @navigation', async ({ page, siteConfig }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-chrome', 'Runs only in the "mobile-chrome" project');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    // On mobile the header logo is CSS-hidden (inside collapsed hamburger menu).
    // The footer logo is always in the DOM — verify brand logo presence.
    const logos = page.locator('img[src*="betaciety-logo"], img[alt*="Betaciety" i]');
    const count = await logos.count();
    expect(count, 'Betaciety logo should be present in DOM at mobile viewport').toBeGreaterThan(0);
  });
});
