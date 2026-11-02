import { Page, expect } from '@playwright/test';
import { TestSpec } from '../ai/TestSpecSchema';
import { TestActionRunner } from './TestActionRunner';

/** Executes a validated spec through the existing action runner, then checks its outcomes. */
export class TestSpecRunner {
    private readonly actionRunner = new TestActionRunner();

    async run(page: Page, spec: TestSpec): Promise<void> {
        try {
            await page.goto(spec.url);
        } catch (error) {
            throw new Error(`Test "${spec.title}" could not open ${spec.url}: ${this.message(error)}`);
        }

        for (const [index, action] of spec.actions.entries()) {
            try {
                await this.actionRunner.run(page, action);
            } catch (error) {
                const name = action.action === 'pageObject'
                    ? `${action.target.pageObject}.${action.target.method}`
                    : action.action;
                throw new Error(`Test "${spec.title}" failed at action ${index + 1}/${spec.actions.length} (${name}): ${this.message(error)}`);
            }
        }

        for (const [index, assertion] of spec.assertions.entries()) {
            const description = this.describeAssertion(assertion);
            try {
                switch (assertion.type) {
                    case 'url':
                        await expect(page).toHaveURL(assertion.expected);
                        break;
                    case 'textVisible':
                        await expect(
                            page.getByText(assertion.text, { exact: true })
                                .filter({ visible: true })
                                .first()
                        ).toBeVisible();
                        break;
                    case 'value':
                        await expect(page.locator(assertion.selector)).toHaveValue(assertion.expected);
                        break;
                    case 'count':
                        await expect(page.locator(assertion.selector)).toHaveCount(assertion.expected);
                        break;
                    case 'enabled':
                        await expect(page.locator(assertion.selector)).toBeEnabled();
                        break;
                    case 'disabled':
                        await expect(page.locator(assertion.selector)).toBeDisabled();
                        break;
                }
            } catch (error) {
                throw new Error(`Test "${spec.title}" failed at expected check ${index + 1}/${spec.assertions.length} (${description}): ${this.message(error)}`);
            }
        }
    }

    private describeAssertion(assertion: TestSpec['assertions'][number]): string {
        switch (assertion.type) {
            case 'url': return `URL is ${assertion.expected}`;
            case 'textVisible': return `text is visible: "${assertion.text}"`;
            case 'value': return `${assertion.selector} has value "${assertion.expected}"`;
            case 'count': return `${assertion.selector} count is ${assertion.expected}`;
            case 'enabled': return `${assertion.selector} is enabled`;
            case 'disabled': return `${assertion.selector} is disabled`;
        }
    }

    private message(error: unknown): string {
        return error instanceof Error ? error.message : String(error);
    }
}
