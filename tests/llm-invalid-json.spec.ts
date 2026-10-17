import { test, expect } from '@playwright/test';

test('should reject invalid JSON from LLM', async () => {

    const invalidJson = `
        {
            "action": "click",
            "target":
    `;

    let errorMessage = '';

    try {
        JSON.parse(invalidJson);
    } catch {
        errorMessage = `LLM returned invalid JSON: ${invalidJson}`;
    }

    expect(errorMessage).toContain(
        'LLM returned invalid JSON'
    );

    console.log('Error handled:', errorMessage);
});