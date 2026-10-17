import { test, expect } from '@playwright/test';

test('Login and access authenticated API', async ({ request }) => {

    // 1. Login
    const loginResponse = await request.post(
        'https://dummyjson.com/auth/login',
        {
            data: {
                username: 'emilys',
                password: 'emilyspass'
            }
        }
    );

    expect(loginResponse.status()).toBe(200);

    // 2. Get token
    const loginBody = await loginResponse.json();
    const token = loginBody.accessToken;

    expect(token).toBeTruthy();

    // 3. Use token
    const userResponse = await request.get(
        'https://dummyjson.com/auth/me',
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    // 4. Validate protected API
    expect(userResponse.status()).toBe(200);

    const userBody = await userResponse.json();

    console.log('User:', userBody);
});