import { test, expect } from '@playwright/test';
import { TestActionSchema } from '../src/ai/TestActionSchema';

test('should reject invalid LLM actions', async () => {

    const invalidActions = [
        {
            action: 'clic',
            target: {
                category: 'button',
                text: 'Login'
            }
        },

        {
            action: 'click'
        },

        {
            action: 'click',
            target: {
                text: 'Login'
            }
        },

        {
            action: 'click',
            target: {
                category: ''
            }
        }
    ];

    for (const invalidAction of invalidActions) {

        expect(() => {
            TestActionSchema.parse(invalidAction);
        }).toThrow();

        console.log(
            'Rejected invalid action:',
            invalidAction
        );
    }
});