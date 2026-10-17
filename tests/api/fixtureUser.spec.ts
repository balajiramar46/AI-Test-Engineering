import { test, expect } from '../fixtures/api.fixture';
test('Get authenticated user using fixture', async ({ api }) => {

    const response = await api.get('/auth/me');

    console.log('Status:', response.status());

    const body = await response.json();

    console.log('User:', {
        id: body.id,
        username: body.username,
        role: body.role
    });

    expect(response.status()).toBe(200);
    expect(body.username).toBe('emilys');
});