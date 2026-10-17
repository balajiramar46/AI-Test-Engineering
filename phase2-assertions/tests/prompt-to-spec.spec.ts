import { test, expect } from '@playwright/test';
import { MockTestSpecProvider } from '../src/ai/MockTestSpecProvider';
import { PromptToSpecGenerator } from '../src/ai/PromptToSpecGenerator';
import { TestSpecSchema } from '../src/ai/TestSpecSchema';

const generated = new PromptToSpecGenerator(new MockTestSpecProvider());

test('generates a valid structured test spec and Playwright source deterministically', async () => {
    const first = await generated.generate('Click the Login button on the local button test page');
    const second = await generated.generate('Click the Login button on the local button test page');

    expect(first.spec).toEqual(second.spec);
    expect(first.playwrightSpec).toBe(second.playwrightSpec);
    expect(TestSpecSchema.safeParse(first.spec).success).toBe(true);
    expect(first.spec.actions).toHaveLength(1);
    expect(first.playwrightSpec).toContain('test("Click the Login button"');
    expect(first.playwrightSpec).toContain('phase2-button.html');
    expect(first.playwrightSpec).toContain('new TestSpecRunner().run(page, spec)');
});

test('rejects malformed provider output before generating executable source', async () => {
    const invalidProvider = { generate: async () => JSON.stringify({
        title: 'Broken spec', instruction: 'Do something', url: 'http://localhost',
        assertions: [{ type: 'textVisible', text: 'Done' }],
        actions: [{ action: 'fill', target: { category: 'input' } }]
    }) };

    await expect(new PromptToSpecGenerator(invalidProvider).generate('Do something'))
        .rejects.toThrow('invalid test spec');
});
