import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * HomePage — landing page after successful login.
 */
export class HomePage extends BasePage {
  private readonly welcomeHeading: Locator;
  private readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.welcomeHeading = page.getByRole('heading', { name: /welcome/i });
    this.logoutButton   = page.getByRole('link', { name: /logout/i });
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }

  get heading(): Locator {
    return this.welcomeHeading;
  }
}
