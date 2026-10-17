import { test, expect } from '@playwright/test';

test('PATCH update user email', async ({ request }) => {

    const response = await request.patch(
        'https://jsonplaceholder.typicode.com/users/1',
        {
            data: {
                email: 'newemail@test.com'
            }
        }
    );

    console.log('Status:', response.status());

    const body = await response.json();

    console.log('Response:', body);
    expect(response.status()).toBe(200);
expect(body.id).toBe(1);
expect(body.email).toBe('newemail@test.com');
});


test('DELETE user API', async ({ request }) => {

    const response = await request.delete(
        'https://jsonplaceholder.typicode.com/users/1'
    );

    console.log('Status:', response.status());

    const body = await response.json();

    console.log('Response:', body);
});