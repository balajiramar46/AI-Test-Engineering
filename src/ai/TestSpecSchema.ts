import { z } from 'zod';
import { TestActionSchema } from './TestActionSchema';

export const TestAssertionSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('url'), expected: z.string().min(1) }),
    z.object({ type: z.literal('textVisible'), text: z.string().min(1) }),
    z.object({ type: z.literal('value'), selector: z.string().min(1), expected: z.string() }),
    z.object({ type: z.literal('count'), selector: z.string().min(1), expected: z.number().int().nonnegative() }),
    z.object({ type: z.literal('enabled'), selector: z.string().min(1) }),
    z.object({ type: z.literal('disabled'), selector: z.string().min(1) })
]);

/** A model-independent, executable description of one generated Playwright test. */
export const TestSpecSchema = z.object({
    title: z.string().min(1),
    instruction: z.string().min(1),
    url: z.string().url(),
    tags: z.array(z.string().min(1)).default([]),
    assertions: z.array(TestAssertionSchema).min(1),
    actions: z.array(TestActionSchema).min(1).superRefine((actions, context) => {
        actions.forEach((action, index) => {
            if (
                (action.action === 'fill' || action.action === 'select' || action.action === 'press' ||
                    (action.action === 'pageObject' && action.target.method !== 'addToCart')) &&
                action.inputValue === undefined
            ) {
                context.addIssue({
                    code: 'custom',
                    path: [index, 'inputValue'],
                    message: `${action.action} action requires inputValue`
                });
            }
        });
    })
});

export type TestSpec = z.infer<typeof TestSpecSchema>;
export type TestAssertion = z.infer<typeof TestAssertionSchema>;

export const MarkdownApiTestCaseSchema = z.object({
    kind: z.literal('api'),
    mode: z.enum(['mock', 'real']).default('mock'),
    title: z.string().min(1),
    instruction: z.string().min(1),
    url: z.string().url(),
    tags: z.array(z.string().min(1)).default([]),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
    headers: z.record(z.string(), z.string()).default({}),
    requestBody: z.unknown().optional(),
    mockStatus: z.number().int().min(100).max(599).optional(),
    mockBody: z.unknown().optional(),
    expectedStatus: z.number().int().min(100).max(599),
    expectedJson: z.array(z.object({ path: z.string().min(1), operator: z.enum(['equals', 'contains']), value: z.unknown() }))
}).superRefine((testCase, context) => {
    if (testCase.mode === 'mock' && (testCase.mockStatus === undefined || testCase.mockBody === undefined)) {
        context.addIssue({ code: 'custom', path: ['Mock Response'], message: 'Mock mode requires a Mock Response status and JSON body.' });
    }
});

export type MarkdownApiTestCase = z.infer<typeof MarkdownApiTestCaseSchema>;
