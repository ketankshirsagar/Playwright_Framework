import { chromium, FullConfig } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

/**
 * globalSetup runs ONCE before any test.
 * We log in via UI, save the auth state (cookies + localStorage), then every
 * test that uses storageState starts already logged in.
 *
 * For projects with stable APIs, prefer doing this via API call (faster).
 * Shown both patterns — UI here, API in auth.setup.ts.
 */
async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL ?? process.env.BASE_URL!;
  const username = process.env.USERNAME ?? 'practice';
  const password = process.env.PASSWORD ?? 'SuperSecretPassword!';

  // Ensure .auth folder exists
  const authDir = path.resolve(__dirname, '../.auth');
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });
  const storagePath = path.join(authDir, 'user.json');

  console.log(`[globalSetup] Logging in via ${baseURL}`);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${baseURL}/login`);
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /login/i }).click();
  await page.waitForURL(/secure|home|dashboard/);

  // Save cookies + localStorage to disk — every test will reuse this
  await context.storageState({ path: storagePath });
  await browser.close();

  console.log(`[globalSetup] Auth state saved to ${storagePath}`);
}

export default globalSetup;
