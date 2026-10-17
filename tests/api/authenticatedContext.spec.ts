import { test, expect } from '@playwright/test';

test('Authenticated API context', async ({ playwright }) => {

    // 1. Login
    const loginContext = await playwright.request.newContext({
        baseURL: 'https://dummyjson.com'
    });

    const loginResponse = await loginContext.post('/auth/login', {
        data: {
            username: 'emilys',
            password: 'emilyspass'
        }
    });

    expect(loginResponse.status()).toBe(200);

    // 2. Extract token
    const loginBody = await loginResponse.json();

    const token = loginBody.accessToken;

    expect(token).toBeTruthy();

    console.log('Token received:', !!token);

    // 3. Create authenticated context
    const authContext = await playwright.request.newContext({
        baseURL: 'https://dummyjson.com',
        extraHTTPHeaders: {
            Authorization: `Bearer ${token}`
        }
    });

    // 4. Call protected API
    const userResponse = await authContext.get('/auth/me');

    console.log('Status:', userResponse.status());

    const userBody = await userResponse.json();

    console.log('User:', {
        id: userBody.id,
        username: userBody.username,
        role: userBody.role
    });

    // 5. Validate
    expect(userResponse.status()).toBe(200);
    expect(userBody.username).toBe('emilys');

    // 6. Cleanup
    await loginContext.dispose();
    await authContext.dispose();
});