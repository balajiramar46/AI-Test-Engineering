
import { Page } from '@playwright/test';
import { LLMProvider } from '../ai/LLMProvider';
import { LLMPromptBuilder } from '../ai/LLMPromptBuilder';
import { LLMTestActionParser } from '../ai/LLMTestActionParser';
import { TestActionRunner } from './TestActionRunner';

const debugLog = (...args: unknown[]): void => {
    if (process.env.FRAMEWORK_DEBUG === '1') console.log(...args);
};

export class LLMTestRunner {

    private promptBuilder: LLMPromptBuilder;
    private parser: LLMTestActionParser;
    private actionRunner: TestActionRunner;

    constructor(private provider: LLMProvider) {
        this.promptBuilder = new LLMPromptBuilder();
        this.parser = new LLMTestActionParser();
        this.actionRunner = new TestActionRunner();
    }

    async run(
        page: Page,
        instruction: string
    ): Promise<void> {

        debugLog('========================================');
        debugLog('AI TEST RUNNER');
        debugLog('========================================');
        debugLog('Instruction:', instruction);

        // 1. Build the prompt
        const prompt = this.promptBuilder.build(instruction);

        debugLog('GENERATED LLM PROMPT');
        debugLog(prompt);

        // 2. Get the LLM response
        const llmResponse = await this.provider.generate(prompt);

        debugLog('LLM RESPONSE');
        debugLog(llmResponse);

        // 3. Parse and validate the complete action sequence
        const testActions = this.parser.parseSequence(llmResponse);

        debugLog('VALIDATED TEST ACTION SEQUENCE');
        debugLog(testActions);

        // 4. Execute actions sequentially
        for (const [index, testAction] of testActions.entries()) {

            debugLog(
                `Executing action ${index + 1} of ${testActions.length}`
            );

            await this.actionRunner.run(page, testAction);
        }

        debugLog('AI TEST RUNNER COMPLETED');
    }
}
