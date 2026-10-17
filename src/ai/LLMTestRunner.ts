
import { Page } from '@playwright/test';
import { LLMProvider } from '../ai/LLMProvider';
import { LLMPromptBuilder } from '../ai/LLMPromptBuilder';
import { LLMTestActionParser } from '../ai/LLMTestActionParser';
import { TestActionRunner } from '../runner/TestActionRunner';

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

        console.log('========================================');
        console.log('AI TEST RUNNER');
        console.log('========================================');
        console.log('Instruction:', instruction);

        const prompt = this.promptBuilder.build(instruction);

        console.log('GENERATED LLM PROMPT');
        console.log(prompt);

        const llmResponse = await this.provider.generate(prompt);

        console.log('LLM RESPONSE');
        console.log(llmResponse);

        // Parse and validate the complete sequence
        const testActions = this.parser.parseSequence(llmResponse);

        console.log('VALIDATED TEST ACTION SEQUENCE');
        console.log(testActions);

        // Execute actions in order
        for (const [index, testAction] of testActions.entries()) {
            console.log(
                `Executing action ${index + 1} of ${testActions.length}`
            );

            await this.actionRunner.run(page, testAction);
        }

        console.log('AI TEST RUNNER COMPLETED');
    }
}
