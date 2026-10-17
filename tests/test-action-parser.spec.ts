import { test, expect } from '@playwright/test';

import { TestActionParser } from '../src/ai/TestActionParser';

test('should convert natural language into TestAction', async () => {

    const parser =
        new TestActionParser();

    const result =
        parser.parse(
            'Click Login'
        );

    console.log(
        'Parsed TestAction:',
        result
    );

    expect(result.action)
        .toBe('click');

    expect(result.target.category)
        .toBe('button');

    expect(result.target.text)
        .toBe('Login');
});