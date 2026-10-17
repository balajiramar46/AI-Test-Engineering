import { Page, expect } from '@playwright/test';
import { TestSpec } from '../ai/TestSpecSchema';
import { TestActionRunner } from './TestActionRunner';

/** Executes a validated spec through the existing action runner, then checks its outcomes. */
export class TestSpecRunner {
    private readonly actionRunner = new TestActionRunner();

    async run(page: Page, spec: TestSpec): Promise<void> {
        await page.goto(spec.url);

        for (const action of spec.actions) {
            await this.actionRunner.run(page, action);
        }

        for (const assertion of spec.assertions) {
            if (assertion.type === 'url') {
                await expect(page).toHaveURL(assertion.expected);
            } else {
                await expect(page.getByText(assertion.text, { exact: true })).toBeVisible();
            }
        }
    }
}
