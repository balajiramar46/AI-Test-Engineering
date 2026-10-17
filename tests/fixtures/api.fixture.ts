import { test as base, expect } from '@playwright/test';

type ApiFixtures = {
    api: any;
};

export const test = base.extend<ApiFixtures>({

    api: async ({ playwright }, use) => {

        // Login context
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

        const loginBody = await loginResponse.json();

        const token = loginBody.accessToken;

        expect(token).toBeTruthy();

        // Authenticated API context
        const apiContext = await playwright.request.newContext({
            baseURL: 'https://dummyjson.com',
            extraHTTPHeaders: {
                Authorization: `Bearer ${token}`
            }
        });

        // Give authenticated API context to test
        await use(apiContext);

        // Cleanup
        await loginContext.dispose();
        await apiContext.dispose();
    }
});

export { expect };

