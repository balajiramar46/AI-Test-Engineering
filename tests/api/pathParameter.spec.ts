import { test, expect } from '@playwright/test';

test('GET user using path parameter', async ({ request }) => {

    const userId = 5;

    const response = await request.get(
        `https://jsonplaceholder.typicode.com/users/${userId}`
    );

    console.log('Status:', response.status());

    const body = await response.json();

    console.log('Response:', body);

    expect(response.status()).toBe(200);
    expect(body.id).toBe(userId);
});