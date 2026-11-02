# Markdown test cases

Write test cases as `.md` files in `test-cases/`. The Markdown Playwright config generates the Playwright specs automatically. Generated files in `generated-tests/` are framework output; edit the Markdown instead.

## Reusable workflows and Page Objects

Reusable workflow actions support `{{parameter}}` values:

```md
## Workflow
- search-product

## Parameters
- product: "laptop"
```

`test-workflows/search-product.md` calls `ProductSearchPage.searchFor`. Page Object methods and locators are implemented in TypeScript under `src/pages/`, then exposed through `PageObjectRegistry`. This keeps application interaction code in one place while scenarios and expected outcomes stay in Markdown.

Supported product search calls:

```md
- call ProductSearchPage.searchFor with "laptop"
- call ProductSearchPage.openProduct with "Laptop"
- call ProductSearchPage.addToCart
```

## Multiple data sets for one scenario

Add an `## Examples` table to a Markdown case. Each table row becomes an independent Playwright test. Use `{{columnName}}` placeholders in the title, prompt, app/API URL, workflow parameters, actions, and expected checks. Column names must match the table headers.

```md
# Search for {{product}}

## App URL
local:test-pages/search.html

## Workflow
- search-product

## Parameters
- product: "{{product}}"

## Expected
- text-visible: "{{expectedProduct}}"

## Examples
| product | expectedProduct |
| --- | --- |
| laptop | Laptop |
| phone | Phone |
```

The generator creates one test per row, with the title populated from that row. Shared steps stay in one Markdown case, while each data set passes or fails independently.

### Keep data in a JSON or CSV file

For data maintained separately from the scenario, use a `## Data File` section instead. The path is relative to `test-cases/` and must point inside that directory. JSON files contain an array of objects with matching fields; CSV files contain a header row followed by data rows. Both formats use the same `{{columnName}}` placeholders and produce one test per row.

```md
## Data File
data/product-search.json
```

See `test-cases/data-driven-search-json.md` and `test-cases/data/product-search.json` for a runnable JSON example. Change the path to a `.csv` file to use CSV data.

## Browser checks

Supported `Expected` checks:

```md
- text-visible: "Laptop"
- url: "/products/laptop"
- value: #search-input equals "laptop"
- count: #results li equals 1
- enabled: #search-input
- disabled: #checkout
```

The value, count, enabled, and disabled checks use CSS selectors.

## Environments

Copy `.env.example` to `.env` and set the test environment URLs. Use `env:APP_BASE_URL/path` for a browser case or `env:API_BASE_URL/path` for an API case. API headers can refer to secrets using `${API_TOKEN}`. `.env` is ignored by Git; use CI secrets for pipeline credentials.

## API modes

API cases default to `mock` mode. Add `Mode: real` to send the request through Playwright's `APIRequestContext` to the configured service. Real requests should target a test environment, and credentials should come from environment variables.

## Tags and commands

Add tags under `## Tags`, for example `- smoke`, `- regression`, or `- live`.

```sh
npm run test:markdown
npm run test:smoke
npm run test:regression
npm run test:ci
npm run test:live
npm run test:all
```

The Markdown, smoke, regression, and CI commands skip `@live` cases so external-site availability does not block local and mocked regression coverage. Use `test:live` for just those cases or `test:all` to include them. The built-in HTML report is saved under `playwright-report/`; failure screenshots and traces are saved under `test-results/`.

The Markdown config also writes Allure result data to `allure-results/`. After running tests, build and open its HTML report with:

```sh
npm run report:allure
npm run open:allure
```

Allure results include test details, tags, and Playwright attachments such as failure screenshots and traces. Allure is configured for this Markdown test config; other Playwright configs continue using their own reporters.
