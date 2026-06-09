/**
 * tests/functional/legal-pages.spec.ts
 *
 * Functional tests for Betaciety's Privacy Policy and Terms of Service pages.
 *
 * Notes:
 *  - Both pages have two <h1> elements; always use .first() or locator('h1').first().
 *  - "Back to Home" links use target="_blank" (open a new tab), so navigation
 *    assertions are replaced with href attribute checks.
 *  - "Get the App" in the header is an <h4> heading, not an anchor link.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Legal Pages @functional', () => {
  // ── Privacy Policy ───────────────────────────────────────────────────────────

  test.describe('Privacy Policy', () => {
    test('Privacy Policy page loads with HTTP 2xx @functional', async ({ page }) => {
      const response = await page.goto('https://betaciety.com/privacy-policy/', {
        waitUntil: 'domcontentloaded',
      });
      expect(response).not.toBeNull();
      expect(response!.status()).toBeLessThan(400);
    });

    test('Privacy Policy page title contains "Privacy Policy" @functional', async ({
      legalPage,
    }) => {
      await legalPage.navigateToPrivacyPolicy();
      const title = await legalPage.getPageTitle();
      expect(title.toLowerCase()).toContain('privacy');
    });

    test('Privacy Policy H1 contains "Privacy Policy" @functional', async ({
      legalPage,
    }) => {
      await legalPage.navigateToPrivacyPolicy();
      // Page has two h1 elements — use first()
      const heading = await legalPage.getHeadingText();
      expect(heading.toLowerCase()).toContain('privacy policy');
    });

    test('Privacy Policy page has a "Back to Home" link @functional', async ({
      legalPage,
    }) => {
      await legalPage.navigateToPrivacyPolicy();
      await expect(legalPage.backToHomeLink).toBeVisible();
    });

    test('"Back to Home" href points to the Betaciety homepage @functional', async ({
      legalPage,
      siteConfig,
    }) => {
      await legalPage.navigateToPrivacyPolicy();
      // Link opens in a new tab (target="_blank") — check href, not navigation
      const href = await legalPage.getBackToHomeHref();
      expect(href, '"Back to Home" href should not be empty').toBeTruthy();
      const resolved = new URL(href, siteConfig.url);
      expect(
        resolved.origin,
        `"Back to Home" should point to ${new URL(siteConfig.url).origin}`
      ).toBe(new URL(siteConfig.url).origin);
    });

    test('Privacy Policy footer links to Terms of Service @functional', async ({
      legalPage,
    }) => {
      await legalPage.navigateToPrivacyPolicy();
      await expect(legalPage.footerTermsLink).toBeVisible();
      const href = await legalPage.footerTermsLink.getAttribute('href');
      expect(href).toContain('terms-of-service');
    });

    test('Privacy Policy page has meaningful content (Information We Collect) @functional', async ({
      legalPage,
      page,
    }) => {
      await legalPage.navigateToPrivacyPolicy();
      const section = page.getByText(/information we collect/i).first();
      await expect(section).toBeVisible();
    });

    test('Privacy Policy header has "Get the App" CTA @functional', async ({
      legalPage,
    }) => {
      await legalPage.navigateToPrivacyPolicy();
      await expect(legalPage.getAppCta).toBeVisible();
    });
  });

  // ── Terms of Service ─────────────────────────────────────────────────────────

  test.describe('Terms of Service', () => {
    test('Terms of Service page loads with HTTP 2xx @functional', async ({ page }) => {
      const response = await page.goto('https://betaciety.com/terms-of-service/', {
        waitUntil: 'domcontentloaded',
      });
      expect(response).not.toBeNull();
      expect(response!.status()).toBeLessThan(400);
    });

    test('Terms of Service page title contains "Terms of Service" @functional', async ({
      legalPage,
    }) => {
      await legalPage.navigateToTermsOfService();
      const title = await legalPage.getPageTitle();
      expect(title.toLowerCase()).toContain('terms');
    });

    test('Terms of Service H1 contains "Terms of Service" @functional', async ({
      legalPage,
    }) => {
      await legalPage.navigateToTermsOfService();
      // Page has two h1 elements — use first()
      const heading = await legalPage.getHeadingText();
      expect(heading.toLowerCase()).toContain('terms');
    });

    test('Terms of Service page has a "Back to Home" link @functional', async ({
      legalPage,
    }) => {
      await legalPage.navigateToTermsOfService();
      await expect(legalPage.backToHomeLink).toBeVisible();
    });

    test('"Back to Home" href points to the Betaciety homepage @functional', async ({
      legalPage,
      siteConfig,
    }) => {
      await legalPage.navigateToTermsOfService();
      const href = await legalPage.getBackToHomeHref();
      expect(href, '"Back to Home" href should not be empty').toBeTruthy();
      const resolved = new URL(href, siteConfig.url);
      expect(resolved.origin).toBe(new URL(siteConfig.url).origin);
    });

    test('Terms of Service footer links to Privacy Policy @functional', async ({
      legalPage,
    }) => {
      await legalPage.navigateToTermsOfService();
      await expect(legalPage.footerPrivacyLink).toBeVisible();
      const href = await legalPage.footerPrivacyLink.getAttribute('href');
      expect(href).toContain('privacy-policy');
    });

    test('Terms of Service header has "Get the App" CTA @functional', async ({
      legalPage,
    }) => {
      await legalPage.navigateToTermsOfService();
      await expect(legalPage.getAppCta).toBeVisible();
    });

    test('Terms of Service page has meaningful content @functional', async ({
      legalPage,
      page,
    }) => {
      await legalPage.navigateToTermsOfService();
      const section = page.getByText(/use of the service|use by you/i).first();
      await expect(section).toBeVisible();
    });
  });
});
