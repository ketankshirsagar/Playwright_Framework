import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { ApiClient } from '../api/ApiClient';

/**
 * Custom fixtures — the most powerful Playwright feature.
 *
 * Each test gets EXACTLY what it asks for. No beforeEach boilerplate.
 *
 * Usage:
 *   test('login flow', async ({ loginPage }) => { ... });
 *   test('api flow',   async ({ apiClient })  => { ... });
 *   test('hybrid',     async ({ loginPage, apiClient }) => { ... });
 */
type Fixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
  apiClient: ApiClient;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
    // teardown can go here if needed (e.g., screenshot on failure)
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  apiClient: async ({ request }, use) => {
    // The 'request' fixture is built into Playwright — independent context, no browser needed.
    const client = new ApiClient(request);
    await use(client);
  },
});

// Re-export expect so tests can do:
//   import { test, expect } from '@fixtures/index';
export { expect };
