import { test, expect } from '@playwright/test';
import { MockTestSpecProvider } from '../src/ai/MockTestSpecProvider';
import { PromptToSpecGenerator } from '../src/ai/PromptToSpecGenerator';
import { TestSpecRunner } from '../src/runner/TestSpecRunner';

test('executes actions from a generated spec against the local test page', async ({ page }) => {
    const { spec, playwrightSpec } = await new PromptToSpecGenerator(
        new MockTestSpecProvider()
    ).generate('Click the Login button on the local button test page');

    expect(playwrightSpec).toContain('new TestSpecRunner().run(page, spec)');
    await new TestSpecRunner().run(page, spec);

    await expect(page.getByText('Login complete', { exact: true })).toBeVisible();
});
