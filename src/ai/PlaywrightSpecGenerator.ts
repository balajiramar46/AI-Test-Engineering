import { TestSpec } from './TestSpecSchema';

/** Turns a validated test spec into a Playwright Test file using the existing runner. */
export class PlaywrightSpecGenerator {
    generate(spec: TestSpec): string {
        const serializedSpec = JSON.stringify(spec, null, 4);

        return `import { test } from '@playwright/test';
import { TestSpec } from '../src/ai/TestSpecSchema';
import { TestSpecRunner } from '../src/runner/TestSpecRunner';

const spec: TestSpec = ${serializedSpec};

test(${JSON.stringify(spec.title)}, async ({ page }) => {
    await new TestSpecRunner().run(page, spec);
});
`;
    }
}
