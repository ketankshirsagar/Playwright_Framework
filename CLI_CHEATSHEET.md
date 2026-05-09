# Playwright CLI Cheat Sheet

Every command you'll need to mention in an interview. Memorize the bold ones.

---

## Run tests

| Command | What it does |
|---|---|
| **`npx playwright test`** | Run all tests, all projects, parallel |
| `npx playwright test login.spec.ts` | Run one file |
| `npx playwright test login.spec.ts:25` | Run test at line 25 |
| **`--project=chromium`** | Only chromium project |
| **`--grep @smoke`** | Only tests tagged `@smoke` |
| `--grep-invert @flaky` | Skip tests tagged `@flaky` |
| **`--headed`** | See the browser run |
| **`--debug`** | Open Playwright Inspector — step through |
| `--ui` | Open the UI mode (best dev experience) |
| `--workers=4` | Cap parallel workers |
| `--retries=2` | Retry failed tests N times |
| `--repeat-each=10` | Run each test N times (flake hunting) |
| `--update-snapshots` | Refresh visual snapshots |
| `--reporter=html,list,junit` | Multiple reporters |
| `--shard=1/4` | Run shard 1 of 4 (CI sharding pattern) |

---

## Reports + traces

| Command | What it does |
|---|---|
| **`npx playwright show-report`** | Open last HTML report |
| **`npx playwright show-trace trace.zip`** | Open a trace file in the viewer |
| `npx playwright show-trace test-results/<dir>/trace.zip` | Open a specific failure's trace |

---

## Codegen + tools

| Command | What it does |
|---|---|
| **`npx playwright codegen https://example.com`** | Record actions → generates code |
| `npx playwright codegen --target=javascript` | JS instead of TS |
| `npx playwright open <url>` | Open Playwright's browser |

---

## Install + setup

| Command | What it does |
|---|---|
| `npx playwright install` | Download browsers |
| **`npx playwright install --with-deps`** | Browsers + Linux system deps (CI) |
| `npx playwright install chromium` | One browser only |
| `npx playwright --version` | Show version |

---

## npm install vs npm ci (interview question)

| | `npm install` | `npm ci` |
|---|---|---|
| Reads | `package.json` | `package-lock.json` |
| Updates lockfile | Yes (can drift) | No (must match exactly) |
| Speed | Slower | Faster |
| When to use | Local dev, adding deps | CI builds, Docker |

**Killer line:** *"In CI I always `npm ci` — it's reproducible. `npm install` would drift the lockfile."*

---

## Common debugging flow

```bash
# 1. Run with trace on (capture everything)
npx playwright test login.spec.ts --trace on

# 2. Open the trace viewer
npx playwright show-trace test-results/login-spec-ts-Login-flow-valid/trace.zip

# 3. Or run in UI mode for live debugging
npx playwright test --ui
```

The trace viewer shows: DOM snapshots at every action, network log, console output, every Playwright API call. It's the killer feature — interview-mention it.

---

## Tagged test patterns

```ts
test('login @smoke', async () => { ... });
test('full regression flow @regression', async () => { ... });
test('flaky thing @skip', async () => { ... });
```

```bash
npx playwright test --grep @smoke              # smoke only
npx playwright test --grep "@smoke|@regression"  # both
npx playwright test --grep-invert @skip         # skip flaky
```

This is how you say *"yes we have a smoke suite and a full regression suite — same codebase, different `--grep`."*
