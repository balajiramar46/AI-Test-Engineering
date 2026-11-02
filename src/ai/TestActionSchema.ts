import { z } from 'zod';

export const TestActionSchema = z.object({
    action: z.enum([
        'click',
        'fill',
        'check',
        'uncheck',
        'select',
        'press',
        'pageObject'
    ]),

    target: z.object({
        category: z.string().min(1),

        text: z.string().optional(),
        value: z.string().optional(),
        id: z.string().optional(),
        name: z.string().optional(),
        placeholder: z.string().optional(),
        ariaLabel: z.string().optional(),
        title: z.string().optional(),
        intent: z.enum(['search']).optional(),
        pageObject: z.enum(['ProductSearchPage']).optional(),
        method: z.enum(['searchFor', 'openProduct', 'addToCart']).optional()
    }),

    inputValue: z.string().optional()
});

export type ValidatedTestAction =
    z.infer<typeof TestActionSchema>;

export const TestActionSequenceSchema = z.object({
    actions: z.array(TestActionSchema).min(1)
});

export type ValidatedTestActionSequence =
    z.infer<typeof TestActionSequenceSchema>;
