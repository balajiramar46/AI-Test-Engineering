import { LLMProvider } from './LLMProvider';
import { PlaywrightSpecGenerator } from './PlaywrightSpecGenerator';
import { TestSpec, TestSpecSchema } from './TestSpecSchema';
import { Page } from '@playwright/test';
import { ElementDiscovery } from '../discovery/ElementDiscovery';

export interface PromptToSpecOptions {
    /** URL of the application under test. */
    appUrl?: string;
    /** An already loaded page whose interactive elements provide generation context. */
    page?: Page;
}

/** Prompt -> provider JSON -> validated test spec -> generated Playwright source. */
export class PromptToSpecGenerator {
    constructor(
        private readonly provider: LLMProvider,
        private readonly specGenerator = new PlaywrightSpecGenerator(),
        private readonly elementDiscovery = new ElementDiscovery()
    ) {}

    async generate(instruction: string, options: PromptToSpecOptions = {}): Promise<{ spec: TestSpec; playwrightSpec: string }> {
        const appUrl = options.appUrl ?? options.page?.url();
        const discoveredElements = options.page
            ? await this.elementDiscovery.scan(options.page)
            : [];
        const prompt = `Convert the user instruction into one test spec as JSON only.\n\n` +
            `Required shape: {"title": string, "instruction": string, "url": string, "actions": TestAction[], "assertions": [{"type":"url","expected":string} | {"type":"textVisible","text":string}]}.\n` +
            `Use only a URL supplied in the instruction or provided page context; do not invent URLs.\n` +
            `Include at least one observable assertion that proves the requested outcome.\n` +
            `Allowed actions: click, fill, check, uncheck, select, press. Each action has a target with a non-empty category and optional text, value, id, or name. Fill, select, and press require inputValue. Do not invent selectors.\n\n` +
            `Caller app URL: ${appUrl ?? 'not supplied'}\n` +
            `Discovered page context (JSON): ${JSON.stringify(discoveredElements)}\n\n` +
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
