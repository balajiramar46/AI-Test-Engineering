import { test, expect } from '@playwright/test';


test('GET non-existing user API', async ({ request }) => {

    const response = await request.get(
        'https://jsonplaceholder.typicode.com/users/999'
    );

    console.log('Status:', response.status());

    expect(response.status()).toBe(404);
});





test('POST create user API', async ({ request }) => {

    const response = await request.post(
        'https://jsonplaceholder.typicode.com/users',
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

    expect(response.status()).toBe(201);
   

expect(body.name).toBe('Balaji');
expect(body.username).toBe('balaji');
expect(body.email).toBe('balaji@test.com');
});