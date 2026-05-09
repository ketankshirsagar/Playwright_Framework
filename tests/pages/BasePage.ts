import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage — every page object extends this.
 * Holds shared utilities: navigation, common waits, screenshot helpers.
 *
 * Hard rule: page objects hold LOCATORS and ACTIONS only.
 * Assertions live in test files, not here. Keeps separation of concerns clean.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {
    this.page = page;
  }

  async goto(path: string = '/'): Promise<void> {
    await this.page.goto(path);
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }

  // Returns the page title — a thin wrapper that tests can assert on
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  // Helper: scroll to element if hidden (rare — modern locators auto-scroll)
  async scrollTo(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }
}
