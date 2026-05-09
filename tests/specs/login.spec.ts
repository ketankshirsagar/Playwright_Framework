import { test, expect } from '../fixtures';

/**
 * UI test using custom fixture { loginPage }.
 * Notice: no beforeEach. The fixture handles instantiation lazily.
 */
test.describe('Login flow', () => {
  test('valid login lands on home @smoke', async ({ loginPage, homePage }) => {
    await loginPage.open();
    await loginPage.login('practice', 'SuperSecretPassword!');
    await expect(homePage.heading).toBeVisible();
  });

  test('invalid login shows error @regression', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login('practice', 'wrong-password');
    await expect(loginPage.error).toBeVisible();
    await expect(loginPage.error).toContainText(/invalid/i);
  });

  test('empty credentials block submit', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login('', '');
    await expect(loginPage.error).toBeVisible();
  });
});
