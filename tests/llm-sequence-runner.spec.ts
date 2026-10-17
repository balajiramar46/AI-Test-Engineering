
import { test, expect } from '@playwright/test';
import { LLMTestRunner } from '../src/runner/LLMTestRunner';
import { MockLLMProvider } from '../src/ai/MockLLMProvider';

test('should execute a multi-step login sequence', async ({ page }) => {

    await page.goto('https://www.saucedemo.com/');

    const provider = new MockLLMProvider();
    const runner = new LLMTestRunner(provider);

    await runner.run(
        page,
        'Log in to SauceDemo using valid credentials'
    );

    // Verify successful login through the business outcome
    await expect(page).toHaveURL(/inventory\.html/);

    await expect(
        page.getByText('Products', { exact: true })
    ).toBeVisible();
});

test('should reject invalid login credentials', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');

    const provider = new MockLLMProvider(
        'invalid_user',
        'wrong_password'
    );

    const runner = new LLMTestRunner(provider);

    await runner.run(
        page,
        'Log in to SauceDemo using invalid credentials'
    );

    // Verify that the login error is displayed
    await expect(page.locator('[data-test="error"]'))
        .toContainText('Username and password do not match');

    // Verify that login did not succeed
    await expect(page).toHaveURL('https://www.saucedemo.com/');

    // Verify that the Products page was not reached
    await expect(
        page.getByText('Products', { exact: true })
    ).not.toBeVisible();
});
