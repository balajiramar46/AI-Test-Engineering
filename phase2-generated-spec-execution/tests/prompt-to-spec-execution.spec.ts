import { test, expect } from '@playwright/test';
import { MockTestSpecProvider } from '../src/ai/MockTestSpecProvider';
import { PromptToSpecGenerator } from '../src/ai/PromptToSpecGenerator';
import { TestActionRunner } from '../src/runner/TestActionRunner';

test('executes actions from a generated spec against the local test page', async ({ page }) => {
    const { spec, playwrightSpec } = await new PromptToSpecGenerator(
        new MockTestSpecProvider()
    ).generate('Click the Login button on the local button test page');

    expect(playwrightSpec).toContain('await page.goto(');
    await page.goto(spec.url);

    await page.locator('button').evaluate(button => {
        button.addEventListener('click', () => {
            button.setAttribute('data-clicked', 'true');
        });
    });

    const runner = new TestActionRunner();
    for (const action of spec.actions) {
        await runner.run(page, action);
    }

    await expect(page.locator('button')).toHaveAttribute('data-clicked', 'true');
});
