/**
 * src/pages/home.page.ts
 *
 * Page Object for the Betaciety homepage.
 *
 * Selector notes:
 *  - WP theme does not emit semantic <header> / role=heading ARIA levels,
 *    so we use tag-level locators (h1, h4, img[src]) rather than role queries.
 *  - Feature card descriptions are baked into image files (bc1–bc4.png),
 *    not DOM text nodes — use src-based locators for them.
 *  - "Get the App" is rendered as an <h4> heading, not an <a> link.
 */

import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import type { SiteConfig } from '@site-types/site-config.types';

export class HomePage extends BasePage {
  // ── Hero ─────────────────────────────────────────────────────────────────────
  readonly heroHeading: Locator;
  readonly heroSubheading: Locator;
  readonly socialProof: Locator;

  // ── App download CTAs ────────────────────────────────────────────────────────
  readonly appStoreLink: Locator;
  readonly googlePlayLink: Locator;

  // ── Header nav ───────────────────────────────────────────────────────────────
  readonly headerLogo: Locator;
  /** "Get the App" is an <h4> call-to-action heading, not an anchor link. */
  readonly getAppCta: Locator;

  // ── Features section ─────────────────────────────────────────────────────────
  readonly featuresHeading: Locator;
  /** Each feature is an image file; bc1–bc4 map to the four feature cards. */
  readonly exploreReviewsItem: Locator;
  readonly shareInsightsItem: Locator;
  readonly followVoicesItem: Locator;
  readonly stayImmersedItem: Locator;
  /** All four feature images as a collection. */
  readonly allFeatureImages: Locator;

  // ── Footer ───────────────────────────────────────────────────────────────────
  readonly footer: Locator;
  readonly footerPrivacyLink: Locator;
  readonly footerTermsLink: Locator;
  readonly footerEmailLink: Locator;
  readonly footerInstagramLink: Locator;

  constructor(page: Page, config: SiteConfig) {
    super(page, config);

    // Hero — use tag-level h1 locator; WP doesn't expose ARIA heading level
    this.heroHeading = page.locator('h1').first();
    this.heroSubheading = page.getByText(/join the future of product discovery/i).first();
    this.socialProof = page.getByText(/500\+/i).first();

    // App downloads
    this.appStoreLink = page.locator('a[href*="apps.apple.com"]').first();
    this.googlePlayLink = page.locator('a[href*="play.google.com"]').first();

    // Header — logo is an img inside an anchor; site uses divs not <header> tag
    this.headerLogo = page
      .locator('img[src*="betaciety-logo"], img[alt*="Betaciety" i], img[src*="logo"]')
      .first();
    // "Get the App" is an <h4> heading element, not an anchor link
    this.getAppCta = page.getByRole('heading', { name: /get the app/i }).first();

    // Features section
    this.featuresHeading = page.getByRole('heading', { name: /what you.ll do here/i });
    // Feature descriptions live inside image files; bc1–bc4 are the image filenames
    this.exploreReviewsItem = page.locator('img[src*="bc1"]').first();
    this.shareInsightsItem = page.locator('img[src*="bc2"]').first();
    this.followVoicesItem = page.locator('img[src*="bc3"]').first();
    this.stayImmersedItem = page.locator('img[src*="bc4"]').first();
    this.allFeatureImages = page.locator(
      'img[src*="bc1"], img[src*="bc2"], img[src*="bc3"], img[src*="bc4"]'
    );

    // Footer
    this.footer = page.locator('footer').first();
    this.footerPrivacyLink = page
      .locator('footer')
      .getByRole('link', { name: /privacy policy/i })
      .first();
    this.footerTermsLink = page
      .locator('footer')
      .getByRole('link', { name: /terms of service/i })
      .first();
    this.footerEmailLink = page.locator('footer a[href^="mailto:"]').first();
    this.footerInstagramLink = page.locator('footer a[href*="instagram.com"]').first();
  }

  // ── Queries ──────────────────────────────────────────────────────────────────

  async getHeroHeadingText(): Promise<string> {
    return (await this.heroHeading.textContent())?.trim() ?? '';
  }

  async getAppStoreHref(): Promise<string> {
    return (await this.appStoreLink.getAttribute('href')) ?? '';
  }

  async getGooglePlayHref(): Promise<string> {
    return (await this.googlePlayLink.getAttribute('href')) ?? '';
  }

  async countAppStoreLinks(): Promise<number> {
    return this.page.locator('a[href*="apps.apple.com"]').count();
  }

  async countGooglePlayLinks(): Promise<number> {
    return this.page.locator('a[href*="play.google.com"]').count();
  }

  /** Count of visible feature images (bc1–bc4). Should be 4 when section is loaded. */
  async countFeatureImages(): Promise<number> {
    return this.allFeatureImages.count();
  }

  async isLoaded(): Promise<boolean> {
    try {
      await this.heroHeading.waitFor({ state: 'visible', timeout: 10_000 });
      return true;
    } catch {
      return false;
    }
  }
}
