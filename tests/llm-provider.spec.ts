import { test, expect } from '@playwright/test';
import { MockLLMProvider } from '../src/ai/MockLLMProvider';

test('should generate response from LLM provider', async () => {

    const provider = new MockLLMProvider();

    const response = await provider.generate(
        'Click the Login button'
    );

    console.log('LLM Response:', response);

    expect(response).toContain('"action":"click"');
    expect(response).toContain('"text":"Login"');
});