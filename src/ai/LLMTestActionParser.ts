
import { TestAction } from '../models/TestAction';

import {
    TestActionSchema,
    TestActionSequenceSchema
} from './TestActionSchema';

export class LLMTestActionParser {

    parse(llmResponse: string): TestAction {

        const parsedResponse = this.parseJSON(llmResponse);

        const validationResult =
            TestActionSchema.safeParse(parsedResponse);

        if (!validationResult.success) {
            throw new Error(
                `LLM returned invalid TestAction: ${validationResult.error.message}`
            );
        }

        return validationResult.data;
    }

    parseSequence(llmResponse: string): TestAction[] {

        const parsedResponse = this.parseJSON(llmResponse);

        const validationResult =
            TestActionSequenceSchema.safeParse(parsedResponse);

        if (!validationResult.success) {
            throw new Error(
                `LLM returned invalid action sequence: ${validationResult.error.message}`
            );
        }

        return validationResult.data.actions;
    }

    private parseJSON(llmResponse: string): unknown {

        try {
            return JSON.parse(llmResponse);
        } catch {
            throw new Error('LLM returned invalid JSON');
        }
    }
}
