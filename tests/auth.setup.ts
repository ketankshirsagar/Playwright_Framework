import { test as setup, expect } from '@playwright/test';
import * as path from 'path';

/**
 * Alternative auth pattern — using the "setup project" model.
 * This file is matched by /.*\.setup\.ts/ in playwright.config.ts.
 *
 * Why two patterns?
 * - globalSetup runs ONCE in a separate browser. Good for simple needs.
 * - Setup project runs as a real test, with full reporting + retries +
 *   fixtures available. Better for complex auth (MFA, multi-role, etc.).
 *
 * In an interview: "I prefer the setup-project pattern because it integrates
 * with retries, reports as a real test, and supports multi-role scenarios."
 */
const authFile = path.resolve(__dirname, '../.auth/user.json');

setup('authenticate as standard user', async ({ page }) => {
  const baseURL = process.env.BASE_URL ?? 'https://practice.expandtesting.com';
  const username = process.env.USERNAME ?? 'practice';
  const password = process.env.PASSWORD ?? 'SuperSecretPassword!';

  await page.goto(`${baseURL}/login`);
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /login/i }).click();

  // Wait for the post-login indicator — be specific, not arbitrary
  await expect(page.getByRole('link', { name: /logout/i })).toBeVisible();

  await page.context().storageState({ path: authFile });
});
