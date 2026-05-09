# Playwright + TypeScript Test Framework

A production-grade Playwright framework demonstrating Page Object Model, custom fixtures, API testing, storageState authentication, and CI/CD integration.

---

## Quick start

```bash
npm ci
npx playwright install --with-deps
cp .env.example .env       # edit values
npm test
```

---

## Architecture

```
Playwright_Framework/
├── tests/
│   ├── pages/          ← Page Objects (locators + actions, NO assertions)
│   │   ├── BasePage.ts
│   │   ├── LoginPage.ts
│   │   └── HomePage.ts
│   ├── api/            ← Type-safe API client with Zod validation
│   │   └── ApiClient.ts
│   ├── fixtures/       ← Custom fixtures = dependency injection for tests
│   │   └── index.ts
│   ├── specs/          ← Test files (where assertions live)
│   │   ├── login.spec.ts     (UI)
│   │   ├── api.spec.ts       (pure API, full CRUD)
│   │   └── hybrid.spec.ts    (API setup → UI verify)
│   ├── auth.setup.ts   ← Setup project pattern (auth via UI, save storageState)
│   └── global-setup.ts ← Alternative: run-once-before-all setup
├── playwright.config.ts ← Brain: projects, workers, retries, reporter
├── Jenkinsfile         ← Declarative CI pipeline
├── CLI_CHEATSHEET.md   ← Every command you'll need
└── .auth/              ← Saved auth state (gitignored)
```

---

## Design principles (the interview talking points)

1. **POM** — page objects hold locators + actions, never assertions
2. **Fixtures over hooks** — replace `beforeEach` with `{ loginPage, apiClient }` parameters
3. **storageState auth** — log in once, every test starts authenticated → cuts test time by ~50%
4. **Modern locators** — `getByRole`, `getByLabel` — auto-waiting, accessible, self-healing
5. **Web-first assertions** — `expect(locator).toBeVisible()` retries automatically
6. **Trace-on-failure** — full debugging artifact for every CI failure
7. **Type-safe API client** — generics + Zod schema validation
8. **Tag-based runs** — `@smoke` / `@regression` via `--grep`
9. **Sharding-ready** — `--shard=1/N` for CI parallelism across nodes

---

## Run modes

```bash
npm test                   # default — all browsers, all projects, parallel
npm run test:headed        # see the browser
npm run test:debug         # step through
npm run test:ui            # the best dev experience
npm run test:smoke         # tagged @smoke only
npm run test:chromium      # one browser
npm run test:api           # API-only project
npm run report             # open last HTML report
```

---

## How auth works

1. `globalSetup` (or `auth.setup.ts`) runs ONCE
2. Logs in via UI, saves cookies + localStorage to `.auth/user.json`
3. Every project (`chromium`, `firefox`, `webkit`) loads this file via `storageState`
4. Tests start logged in — no UI login needed in test code

Net effect: **a 30-test suite that would take 5 minutes (login per test) runs in 1.5 minutes.**

---

## CI

`Jenkinsfile` is included. Key features:

- Runs in `mcr.microsoft.com/playwright` Docker image (browsers preinstalled)
- Parameterized: choose browser, tag, worker count from Jenkins UI
- `npm ci` (lockfile-locked, reproducible)
- Publishes HTML report + JUnit XML
- Slack/Email hook on failure

---

## What I'd add next (nice to mention)

- **Visual regression** — `expect(page).toHaveScreenshot()` with baselines
- **Test data factory** — pure functions producing test users / records
- **Multi-role storageState** — separate JSON per role (admin, user, viewer)
- **Allure reporter** — richer reports than the built-in HTML
- **Lighthouse audit** — a11y + perf checks integrated into the suite

---

## Trade-offs (interview honesty)

- **Selenium**: more mature ecosystem, broader language support, but slower and more flaky out of the box
- **Cypress**: nicer DX for frontend devs, but limited cross-origin support and only one browser tab
- **Playwright**: best of both — multi-browser, multi-tab, multi-context, fast — at the cost of being newer and less Stack Overflow coverage

Pick based on the team. For a fresh project with API + UI + multi-browser, Playwright wins for me.
