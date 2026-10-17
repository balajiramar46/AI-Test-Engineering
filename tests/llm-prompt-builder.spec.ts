import { test, expect } from '@playwright/test';
import { LLMPromptBuilder } from '../src/ai/LLMPromptBuilder';

test('should build structured LLM prompt', async () => {

    const builder = new LLMPromptBuilder();

    const prompt = builder.build(
        'Click the Login button'
    );

    console.log('Generated Prompt:');
    console.log(prompt);

    expect(prompt).toContain(
        'Click the Login button'
    );

    expect(prompt).toContain(
        'The response MUST be valid JSON'
    );

    expect(prompt).toContain(
        'Do not invent selectors'
    );
});