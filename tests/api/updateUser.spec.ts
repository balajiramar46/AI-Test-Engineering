import { test, expect } from '@playwright/test';

test('PUT update user API', async ({ request }) => {

    const response = await request.put(
        'https://jsonplaceholder.typicode.com/users/1',
        {
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
    expect(response.status()).toBe(200);

expect(body.id).toBe(1);
expect(body.name).toBe('Balaji');
expect(body.username).toBe('balaji');
expect(body.email).toBe('balaji@test.com');
});