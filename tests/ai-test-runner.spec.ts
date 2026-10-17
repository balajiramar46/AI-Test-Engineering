import { test } from '@playwright/test';
import { LLMProviderFactory } from '../src/ai/LLMProviderFactory';
import { LLMTestRunner } from '../src/runner/LLMTestRunner';
import 'dotenv/config';

test('should execute AI-generated test action', async ({ page }) => {

    await page.goto(
        'http://127.0.0.1:8081/button.html'
    );

    const provider =
        LLMProviderFactory.create('mock');

    const runner =
        new LLMTestRunner(provider);

    const instruction =
        'Click the Login button';

    await runner.run(
        page,
        instruction
    );

    console.log(
        'AI-generated test completed successfully'
    );
});