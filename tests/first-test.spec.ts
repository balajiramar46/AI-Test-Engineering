import { test } from '@playwright/test';

import { TestAction } from '../src/models/TestAction';
import { TestActionRunner } from '../src/runner/TestActionRunner';

test('competing candidates test', async ({ page }) => {

    await page.goto(
        'http://127.0.0.1:8081/competing.html'
    );

    console.log(
        'Page title:',
        await page.title()
    );

    const testAction: TestAction = {

        action: 'click',

        target: {
            category: 'button',
            text: 'Login'
        }
    };

    const runner =
        new TestActionRunner();

    await runner.run(
        page,
        testAction
    );

    console.log(
        'Competing candidates test completed'
    );
});