import { LLMProvider } from './LLMProvider';
import { PlaywrightSpecGenerator } from './PlaywrightSpecGenerator';
import { TestSpec, TestSpecSchema } from './TestSpecSchema';

/** Prompt -> provider JSON -> validated test spec -> generated Playwright source. */
export class PromptToSpecGenerator {
    constructor(
        private readonly provider: LLMProvider,
        private readonly specGenerator = new PlaywrightSpecGenerator()
    ) {}

    async generate(instruction: string): Promise<{ spec: TestSpec; playwrightSpec: string }> {
        const prompt = `Convert the user instruction into one test spec as JSON only.\n\n` +
            `Required shape: {"title": string, "instruction": string, "url": string, "actions": TestAction[]}.\n` +
            `Use only a URL supplied in the instruction or provided page context; do not invent URLs.\n` +
            `Allowed actions: click, fill, check, uncheck, select. Each action has a target with a non-empty category and optional text, value, id, or name. Fill and select require inputValue. Do not invent selectors.\n\n` +
            `User instruction:\n${instruction}`;

        const response = await this.provider.generate(prompt);
        let data: unknown;
        try {
            data = JSON.parse(response);
        } catch {
            throw new Error('Provider returned invalid test-spec JSON');
        }

        const parsed = TestSpecSchema.safeParse(data);
        if (!parsed.success) {
            throw new Error(`Provider returned an invalid test spec: ${parsed.error.message}`);
        }

        return {
            spec: parsed.data,
            playwrightSpec: this.specGenerator.generate(parsed.data)
        };
    }
}
