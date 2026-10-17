
import { test } from '@playwright/test';

test('inspect SauceDemo input elements', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');

    const inputs = page.locator('input');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);

        console.log(`Input ${i}:`, {
            type: await input.getAttribute('type'),
            id: await input.getAttribute('id'),
            name: await input.getAttribute('name'),
            placeholder: await input.getAttribute('placeholder')
        });
    }
});
