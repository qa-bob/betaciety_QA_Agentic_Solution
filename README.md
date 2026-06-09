# Betaciety — QA Agentic Solution

> Playwright + TypeScript regression test suite for [betaciety.com](https://betaciety.com/).

---

## Company Profile

| Field | Details |
|-------|---------|
| **Company** | Betaciety |
| **Description** | Mobile app for authentic product discovery and trusted brand relationships |
| **Website** | [https://betaciety.com/](https://betaciety.com/) |
| **LinkedIn** | [View Profile](https://www.linkedin.com/company/betaciety/) |
| **City** | Phoenix |
| **Founded** | 2021 |
| **Funding** | Self-funded |
| **Employees** | 1–10 |
| **Leaders** | Robert Johnson (Founder) |

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm 9 or later (bundled with Node.js)
- Git

---

## Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd betaciety_QA_Agentic_Solution

# 2. Install Node dependencies
npm install

# 3. Install Playwright browsers (Chromium only required; installs all by default)
npx playwright install --with-deps chromium
```

> **Note:** The test suite targets three browser configurations (Desktop Chrome, Mobile Chrome, and a Chromium-based tablet profile). No WebKit or Firefox installation is required.

---

## Capture Visual Baselines

Visual regression tests compare screenshots against stored baselines. Baselines are **not** committed to the repository (see `.gitignore`) and must be generated once per environment before running the full suite.

```bash
npm run baseline
```

This runs the `@visual` tests in snapshot-update mode and writes PNG files to `__snapshots__/`. It takes approximately 2–3 minutes. Re-run any time the site design changes intentionally.

---

## Running Tests

```bash
# Run the full suite (all tags, all three browser projects)
npm test

# Run by tag
npm run test:smoke          # Availability and basic load checks
npm run test:navigation     # Nav links, routing, footer links
npm run test:functional     # Hero, features, app downloads, legal pages
npm run test:visual         # Screenshot regression (requires baselines)
npm run test:responsive     # Layout at mobile / tablet / desktop viewports

# Open the interactive Playwright UI
npx playwright test --ui

# Run a single spec file
npx playwright test tests/functional/hero.spec.ts

# Run against a specific browser project
npx playwright test --project=chromium-desktop
npx playwright test --project=mobile-chrome
npx playwright test --project=tablet
```

---

## Expected Results

| Category | Tests | Notes |
|----------|-------|-------|
| Smoke | 30 | 10 per browser project |
| Navigation | 39 | 13 per browser project |
| Forms | 15 (skipped) | Site has no contact form — `skipForms: true` in config |
| Functional | 120 | Hero, features, app downloads, legal pages |
| Visual | 15 | 5 screenshots × 3 browser projects |
| Responsive | 30 | 10 per browser project |
| **Total** | **240 passed / 15 skipped** | |

---

## Project Structure

```
betaciety_QA_Agentic_Solution/
├── site.config.json          # Site URL, name, feature flags
├── playwright.config.ts      # Browser projects, timeouts, snapshot paths
├── global-setup.ts           # Reachability check before test run
├── src/
│   ├── pages/
│   │   ├── base.page.ts      # BasePage base class
│   │   ├── home.page.ts      # HomePage
│   │   ├── navigation.page.ts
│   │   ├── contact.page.ts
│   │   └── legal.page.ts     # Privacy Policy + Terms of Service
│   ├── fixtures/
│   │   └── site.fixture.ts   # Custom test fixtures (auto-navigates homePage)
│   ├── utils/
│   │   ├── visual-helper.ts  # freezeAnimations, waitForImagesLoaded, dismissCookieBanner
│   │   └── link-checker.ts
│   └── types/
│       └── site-config.types.ts
├── tests/
│   ├── smoke/
│   │   └── site-availability.spec.ts
│   ├── navigation/
│   │   └── nav-links.spec.ts
│   ├── forms/
│   │   └── contact-form.spec.ts  # Skipped (skipForms: true)
│   ├── functional/
│   │   ├── hero.spec.ts
│   │   ├── features.spec.ts
│   │   ├── app-downloads.spec.ts
│   │   └── legal-pages.spec.ts
│   ├── visual/
│   │   └── visual-regression.spec.ts
│   └── responsive/
│       └── layout.spec.ts
└── __snapshots__/            # Visual baselines (gitignored, generate with npm run baseline)
```

---

## Architecture

The suite follows the **Page Object Model (POM)** pattern:

- Every page or section has a class in `src/pages/` that extends `BasePage`
- Locators are `readonly Locator` properties; methods represent user actions only
- No `expect()` assertions inside page objects — assertions belong in tests
- Tests import `{ test, expect }` from `src/fixtures/site.fixture.ts` (not directly from `@playwright/test`)
- The `homePage` fixture auto-navigates to the site root before each test; other fixtures do not

### WordPress-specific notes

The betaciety.com WordPress theme has several quirks accounted for in the selectors:

- No semantic `<header>` element — logo is identified by `img[src*="betaciety-logo"]`
- No ARIA heading levels — use `page.locator('h1').first()`, not `getByRole('heading', { level: 1 })`
- Two `<h1>` elements on every page — always use `.first()`
- Feature descriptions are baked into image files (`bc1.png`–`bc4.png`), not DOM text
- "Get the App" is rendered as an `<h4>` heading, not an `<a>` link
- Header logo is CSS-hidden on mobile/tablet viewports (inside collapsed hamburger menu)
- Five duplicate `<meta name="viewport">` tags — scope to `head meta[name="viewport"]`

---

## Visual Regression Notes

- Homepage screenshots use `fullPage: false` (viewport only) to avoid animation variance from below-the-fold content
- Tolerance is `maxDiffPixelRatio: 0.25` (25%) for homepage due to rAF-driven animations and third-party widgets that cannot be fully frozen
- Legal page screenshots use `fullPage: true` with a strict `maxDiffPixels: 500` tolerance
- Playwright 1.60 uses `maxDiffPixelRatio` — newer docs may show `maxDiffRatio` which is silently ignored in this version

---

## npm Scripts Reference

| Script | Command |
|--------|---------|
| `npm test` | Run all tests |
| `npm run test:smoke` | `@smoke` tests only |
| `npm run test:navigation` | `@navigation` tests only |
| `npm run test:forms` | `@forms` tests only (currently all skipped) |
| `npm run test:visual` | `@visual` tests only |
| `npm run test:responsive` | `@responsive` tests only |
| `npm run baseline` | Update visual regression snapshots |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type check (`tsc --noEmit`) |

---

*Generated as part of the Phoenix Startup QA Agentic Solutions project.*
