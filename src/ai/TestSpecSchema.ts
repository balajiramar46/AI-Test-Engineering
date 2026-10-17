import { z } from 'zod';
import { TestActionSchema } from './TestActionSchema';

export const TestAssertionSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('url'), expected: z.string().min(1) }),
    z.object({ type: z.literal('textVisible'), text: z.string().min(1) })
]);

/** A model-independent, executable description of one generated Playwright test. */
export const TestSpecSchema = z.object({
    title: z.string().min(1),
    instruction: z.string().min(1),
    url: z.string().url(),
    assertions: z.array(TestAssertionSchema).min(1),
    actions: z.array(TestActionSchema).min(1).superRefine((actions, context) => {
        actions.forEach((action, index) => {
            if (
                (action.action === 'fill' || action.action === 'select') &&
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
