import { test, expect } from '@playwright/test';

test('POST API with headers', async ({ request }) => {

    const response = await request.post(
        'https://jsonplaceholder.typicode.com/users',
        {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },

            data: {
                name: 'Balaji',
                username: 'balaji',
                email: 'balaji@test.com'
            }
        }
    );

    console.log('Status:', response.status());

    const body = await response.json();

    console.log('Response:', body);

    expect(response.status()).toBe(201);
    expect(body.name).toBe('Balaji');
    console.log('Response headers:', response.headers());
});