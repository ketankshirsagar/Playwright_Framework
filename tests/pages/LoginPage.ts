import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * LoginPage — concrete page object for the login flow.
 * Demonstrates: locator strategy, action methods, no assertions.
 */
export class LoginPage extends BasePage {
  // Locators are class fields — initialized in constructor.
  // Prefer modern user-facing locators (getByRole/Label/Placeholder) over CSS.
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly logoutLink: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByLabel('Username');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton   = page.getByRole('button', { name: /login/i });
    this.errorMessage  = page.locator('#flash');
    this.logoutLink    = page.getByRole('link', { name: /logout/i });
  }

  async open(): Promise<void> {
    await this.goto('/login');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
  }

  // Returns the error text — test can assert on it.
  // No assertion HERE. That's the rule.
  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) ?? '';
  }

  // Exposes a locator so the test can use web-first assertions like expect().toBeVisible()
  get error(): Locator {
    return this.errorMessage;
  }
}
