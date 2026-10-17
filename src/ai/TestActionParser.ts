import { TestAction } from '../models/TestAction';

export class TestActionParser {

    parse(
        instruction: string
    ): TestAction {

        const normalized =
            instruction
                .trim()
                .toLowerCase();

        if (
            normalized.startsWith('click ')
        ) {

            const text =
                instruction
                    .substring(6)
                    .trim();

            return {
                action: 'click',

                target: {
                    category: 'button',
                    text
                }
            };
        }

        throw new Error(
            `Unable to understand instruction: ${instruction}`
        );
    }
}