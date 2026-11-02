
import { Page } from '@playwright/test';
import { LLMProvider } from '../ai/LLMProvider';
import { LLMPromptBuilder } from '../ai/LLMPromptBuilder';
import { LLMTestActionParser } from '../ai/LLMTestActionParser';
import { TestActionRunner } from '../runner/TestActionRunner';

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

        const prompt = this.promptBuilder.build(instruction);

        debugLog('GENERATED LLM PROMPT');
        debugLog(prompt);

        const llmResponse = await this.provider.generate(prompt);

        debugLog('LLM RESPONSE');
        debugLog(llmResponse);

        // Parse and validate the complete sequence
        const testActions = this.parser.parseSequence(llmResponse);

        debugLog('VALIDATED TEST ACTION SEQUENCE');
        debugLog(testActions);

        // Execute actions in order
        for (const [index, testAction] of testActions.entries()) {
            debugLog(
                `Executing action ${index + 1} of ${testActions.length}`
            );

            await this.actionRunner.run(page, testAction);
        }

        debugLog('AI TEST RUNNER COMPLETED');
    }
}
