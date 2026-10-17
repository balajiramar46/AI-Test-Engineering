import { test } from '@playwright/test';

import { TestActionParser } from '../src/ai/TestActionParser';
import { TestActionRunner } from '../src/runner/TestActionRunner';

test('should execute natural language instruction', async ({ page }) => {

    await page.goto(
        'http://127.0.0.1:8081/button.html'
    );

    const instruction =
        'Click Login';

    console.log(
        'Natural language instruction:',
        instruction
    );

    const parser =
        new TestActionParser();

    const testAction =
        parser.parse(instruction);

    console.log(
        'Generated TestAction:',
        testAction
    );

    const runner =
        new TestActionRunner();

    await runner.run(
        page,
        testAction
    );

    console.log(
        'Natural language action completed'
    );
});