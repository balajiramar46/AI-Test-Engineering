import { test, expect } from '@playwright/test';

test('API context example', async ({ playwright }) => {

    const apiContext = await playwright.request.newContext({
        baseURL: 'https://dummyjson.com'
    });

    const response = await apiContext.get('/users/1');

    console.log('Status:', response.status());

    const body = await response.json();

    console.log('User:', body);

    expect(response.status()).toBe(200);

    await apiContext.dispose();
});