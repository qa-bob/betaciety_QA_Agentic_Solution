/**
 * src/pages/legal.page.ts
 *
 * Page Object for Betaciety's legal pages:
 *   /privacy-policy/   — Privacy Policy
 *   /terms-of-service/ — Terms of Service
 *
 * Notes:
 *  - Both pages contain TWO <h1> elements; use .first() to avoid strict-mode errors.
 *  - "Back to Home" links have target="_blank" and open a new tab — do not
 *    assert on page navigation; check the href attribute instead.
 */

import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import type { SiteConfig } from '@site-types/site-config.types';

export class LegalPage extends BasePage {
  /** First <h1> on the page (both legal pages have two h1 elements). */
  readonly pageHeading: Locator;
  /** "Back to Home" link — has target="_blank", opens new tab. */
  readonly backToHomeLink: Locator;
  readonly footerPrivacyLink: Locator;
  readonly footerTermsLink: Locator;
  /** "Get the App" heading in site header (rendered as h4). */
  readonly getAppCta: Locator;

  constructor(page: Page, config: SiteConfig) {
    super(page, config);

    this.pageHeading = page.locator('h1').first();
    this.backToHomeLink = page.getByRole('link', { name: /back to home/i }).first();
    this.footerPrivacyLink = page
      .locator('footer')
      .getByRole('link', { name: /privacy policy/i })
      .first();
    this.footerTermsLink = page
      .locator('footer')
      .getByRole('link', { name: /terms of service/i })
      .first();
    this.getAppCta = page.getByRole('heading', { name: /get the app/i }).first();
  }

  // ── Navigation ───────────────────────────────────────────────────────────────

  async navigateToPrivacyPolicy(): Promise<void> {
    const base = this.config.url.replace(/\/$/, '');
    await this.page.goto(`${base}/privacy-policy/`, { waitUntil: 'domcontentloaded' });
  }

  async navigateToTermsOfService(): Promise<void> {
    const base = this.config.url.replace(/\/$/, '');
    await this.page.goto(`${base}/terms-of-service/`, { waitUntil: 'domcontentloaded' });
  }

  async getHeadingText(): Promise<string> {
    return (await this.pageHeading.textContent())?.trim() ?? '';
  }

  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Return the href of the "Back to Home" link without clicking it.
   * The link opens in a new tab (target="_blank"), so clicking is unreliable
   * for same-page URL assertions.
   */
  async getBackToHomeHref(): Promise<string> {
    return (await this.backToHomeLink.getAttribute('href')) ?? '';
  }
}
