import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Playwright config — the "brain" of the framework.
 * Documented heavily so each block can be explained in interview.
 */
export default defineConfig({
  // Where tests live
  testDir: './tests/specs',

  // Run all tests in parallel (one of Playwright's killer features)
  fullyParallel: true,

  // Fail the build if test.only is left in source (CI safety)
  forbidOnly: !!process.env.CI,

  // Retries: 1 in CI to absorb flakes, 0 locally so you fix root cause
  retries: process.env.CI ? 1 : 0,

  // Workers: undefined lets Playwright pick (CPU count); cap at 4 in CI for stability
  workers: process.env.CI ? 4 : undefined,

  // Reporters — list (terminal) + html (artifact) + junit (Jenkins) + allure (rich CI dashboard)
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['allure-playwright', {
      outputFolder: 'allure-results',
      detail: true,                       // capture step-level details
      suiteTitle: false,                  // use describe() titles directly
      environmentInfo: {
        framework: 'Playwright',
        node: process.version,
        os: process.platform,
      },
    }],
  ],

  // Global timeout per test
  timeout: 60_000,
  expect: { timeout: 10_000 },

  // Shared settings for all projects
  use: {
    baseURL: process.env.BASE_URL ?? 'https://practice.expandtesting.com',
    trace: 'retain-on-failure',     // trace only kept for failed tests — cheap + useful
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },

  // Run login once before all tests, save auth state to disk
  globalSetup: require.resolve('./tests/global-setup'),

  // Projects = different browsers / configs run in parallel
  projects: [
    // Setup project that creates the auth state — others depend on it
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',     // every test starts logged in
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
    },
    // API-only project — no browser, just request fixture
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        baseURL: process.env.API_BASE_URL ?? 'https://practice.expandtesting.com/notes/api',
      },
    },
  ],
});
