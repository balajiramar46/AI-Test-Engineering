import { TestSpec } from './TestSpecSchema';

/** Turns a validated test spec into a Playwright Test file using the existing runner. */
export class PlaywrightSpecGenerator {
    generate(spec: TestSpec): string {
        const serializedSpec = JSON.stringify(spec, null, 4);

        return `import { test } from '@playwright/test';
import { TestActionRunner } from '../src/runner/TestActionRunner';

const spec = ${serializedSpec} as const;

test(${JSON.stringify(spec.title)}, async ({ page }) => {
    await page.goto(${JSON.stringify(spec.url)});
    const runner = new TestActionRunner();

    for (const action of spec.actions) {
        await runner.run(page, action);
    }
});
`;
    }
}
