# Playwright Advanced Capabilities — Scenarios + Syntax

The 5 differentiator topics. Each: real-world scenario → why → syntax → killer line.

---

## 1. `page.route()` — Network Mocking

**Scenario:** Payment API takes 30s and is flaky. Mock it for instant, deterministic tests.

```ts
// Mock success
await page.route('**/api/users', route => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([{ id: 1, name: 'Mocked' }]),
  });
});

// Test error path
await page.route('**/api/users', r => r.fulfill({ status: 500 }));

// Block third-party
await page.route('**/google-analytics.com/**', r => r.abort());

// Modify request
await page.route('**/api/**', async route => {
  const headers = { ...route.request().headers(), 'X-Test': 'true' };
  await route.continue({ headers });
});

// Slow network
await page.route('**/api/**', async route => {
  await new Promise(r => setTimeout(r, 3000));
  await route.continue();
});
```

**When to use:** Server errors, timeouts, empty data, third-party blocking, auth failure tests.

---

## 2. `expect.soft()` — Soft Assertions

**Scenario:** Dashboard with 8 widgets — see ALL failures in one run.

```ts
await expect.soft(page.getByText('Sales')).toBeVisible();
await expect.soft(page.getByText('Revenue')).toBeVisible();
await expect.soft(page.getByText('Customers')).toBeVisible();
// All 3 run; failures collected and reported at end
```

**When NOT to use:** Preconditions (login success). Continuing makes no sense if a precondition broke.

---

## 3. Hooks + `testInfo`

**Scenario:** Auto-screenshot on every failure without polluting test code.

```ts
test.describe('User suite', () => {
  test.beforeAll(async () => { /* once before all */ });
  test.afterAll(async () => { /* once after all */ });

  test.beforeEach(async ({ page }, testInfo) => {
    console.log(`Starting: ${testInfo.title} (retry ${testInfo.retry})`);
    await page.goto('/login');
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status === 'failed') {
      await testInfo.attach('failure-screenshot', {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
    }
  });
});
```

**testInfo properties:**
- `title`, `file`, `project.name`
- `retry` (0 first try)
- `status` ('passed' / 'failed' / 'skipped')
- `duration`
- `attach(name, options)`

---

## 4. Locator Filter / Nth / Chaining

**Scenario:** 20 user cards, need to click "Delete" on Ketan's card.

```ts
// Filter by content
const ketanCard = page.locator('.user-card').filter({ hasText: 'Ketan' });
await ketanCard.getByRole('button', { name: 'Delete' }).click();

// Position
await page.getByRole('button').first().click();
await page.getByRole('listitem').nth(2).click();
await page.getByRole('button').last().click();

// Filter has / hasNot
page.locator('.product').filter({ has: page.locator('.in-stock') });
page.locator('.product').filter({ hasNot: page.locator('.error') });

// Count + iterate
const count = await page.locator('.item').count();
const all = await page.locator('.item').all();
for (const item of all) await item.click();
```

---

## 5. Visual Regression

**Scenario:** CSS refactor broke the layout. Functional tests pass, UI looks broken.

```ts
// Full page
await expect(page).toHaveScreenshot('home.png');

// With options
await expect(page).toHaveScreenshot('home.png', {
  mask: [page.locator('.timestamp')],     // hide dynamic regions
  maxDiffPixels: 100,                     // tolerance
  fullPage: true,
});

// Element only
await expect(page.locator('.card')).toHaveScreenshot('card.png');
```

**Update baselines:** `npx playwright test --update-snapshots`

**Baselines location:** `tests/specs/home.spec.ts-snapshots/home-chromium-darwin.png`

---

## Killer interview lines (memorize)

| Topic | Line |
|---|---|
| **Network mocking** | *"`page.route` for testing edge cases without involving the backend — server errors, slow networks, empty data."* |
| **Soft assertions** | *"Soft for verifying many independent things in one run. Hard for preconditions where continuing makes no sense."* |
| **Hooks + testInfo** | *"`afterEach` with `testInfo.status === 'failed'` for auto-attaching screenshots."* |
| **Locator chaining** | *"`.filter({ hasText })` for content, `.nth()` for position, then chain a child locator."* |
| **Visual regression** | *"Catches CSS-level breakage. Mask dynamic regions, tolerance for anti-aliasing, run on stable CI."* |

---

## Decision tree for tests

```
Test depends on backend? Mock with page.route
Multiple independent assertions? Use expect.soft
Want auto-failure screenshots? afterEach + testInfo
Many similar elements? .filter or .nth or chain
Layout/CSS testing? toHaveScreenshot with mask
```
