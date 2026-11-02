import { test, expect } from '@playwright/test';
import { MarkdownTestCaseParser } from '../src/ai/MarkdownTestCaseParser';
import { TestActionRunner } from '../src/runner/TestActionRunner';

test('infers a search action from Markdown Prompt and selects the best matching input', async ({ page }) => {
    const spec = new MarkdownTestCaseParser().parse(`# Search laptops

## App URL
https://example.test

## Prompt
Search for laptops and confirm that results appear.

## Expected
- text-visible: "Results for laptop"
`);

    expect(spec.actions).toEqual([
        { action: 'fill', target: { category: 'input', intent: 'search' }, inputValue: 'laptops' },
        { action: 'press', target: { category: 'keyboard' }, inputValue: 'Enter' }
    ]);

    await page.setContent(`
        <form>
            <input name="q" placeholder="Search products">
            <input name="q" placeholder="Search products" style="display:none">
            <button type="submit">Search</button>
        </form>
        <p id="results"></p>
        <script>
            document.querySelector('form').addEventListener('submit', event => {
                event.preventDefault();
                document.querySelector('#results').textContent = 'Results for laptop';
            });
        </script>
    `);

    const runner = new TestActionRunner();
    await runner.run(page, spec.actions[0]);
    await runner.run(page, spec.actions[1]);
    await expect(page.getByText('Results for laptop', { exact: true })).toBeVisible();
});

test('parses Enter as a keyboard action and submits the focused form', async ({ page }) => {
    const parsed = new MarkdownTestCaseParser().parse(`# Search form

## App URL
http://127.0.0.1:8081/button.html

## Prompt
Fill the search field and press Enter.

## Actions
- click enter

## Expected
- text-visible: "Submitted"
`);

    expect(parsed.actions).toEqual([{
        action: 'press',
        target: { category: 'keyboard' },
        inputValue: 'Enter'
    }]);

    await page.setContent(`
        <form>
            <input id="query" value="laptop">
            <button type="submit">Search</button>
        </form>
        <p id="result"></p>
        <script>
            document.querySelector('form').addEventListener('submit', event => {
                event.preventDefault();
                document.querySelector('#result').textContent = 'Submitted';
            });
            document.querySelector('#query').focus();
        </script>
    `);

    await new TestActionRunner().run(page, parsed.actions[0]);
    await expect(page.getByText('Submitted', { exact: true })).toBeVisible();
});
