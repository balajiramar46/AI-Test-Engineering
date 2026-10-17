
import { test, expect } from '@playwright/test';
import { LLMTestActionParser } from '../src/ai/LLMTestActionParser';

test('should parse a single TestAction from LLM response', async () => {

    const llmResponse = JSON.stringify({
        action: 'click',
        target: {
            category: 'button',
            text: 'Login'
        }
    });

    const parser = new LLMTestActionParser();

    const result = parser.parse(llmResponse);

    expect(result.action).toBe('click');
    expect(result.target.category).toBe('button');
    expect(result.target.text).toBe('Login');
});

test('should parse a sequence of TestActions from LLM response', async () => {

    const llmResponse = JSON.stringify({
        actions: [
            {
                action: 'fill',
                target: {
                    category: 'input',
                    id: 'user-name'
                },
                inputValue: 'standard_user'
            },
            {
                action: 'fill',
                target: {
                    category: 'input',
                    id: 'password'
                },
                inputValue: 'secret_sauce'
            },
            {
                action: 'click',
                target: {
                    category: 'button',
                    id: 'login-button'
                }
            }
        ]
    });

    const parser = new LLMTestActionParser();

    const results = parser.parseSequence(llmResponse);

    expect(results).toHaveLength(3);

    expect(results[0].action).toBe('fill');
    expect(results[0].target.id).toBe('user-name');
    expect(results[0].inputValue).toBe('standard_user');

    expect(results[1].action).toBe('fill');
    expect(results[1].target.id).toBe('password');
    expect(results[1].inputValue).toBe('secret_sauce');

    expect(results[2].action).toBe('click');
    expect(results[2].target.id).toBe('login-button');
});
