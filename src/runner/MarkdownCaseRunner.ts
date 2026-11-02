import { APIRequestContext, Page } from '@playwright/test';
import { MarkdownApiTestCase, TestSpec } from '../ai/TestSpecSchema';
import { MarkdownApiTestRunner } from './MarkdownApiTestRunner';
import { TestSpecRunner } from './TestSpecRunner';

export type MarkdownCase = TestSpec | MarkdownApiTestCase;

function isApiCase(testCase: MarkdownCase): testCase is MarkdownApiTestCase {
    return 'kind' in testCase && testCase.kind === 'api';
}

/** Dispatches a parsed Markdown case to its browser or API executor. */
export async function runMarkdownCase(page: Page | undefined, request: APIRequestContext, testCase: MarkdownCase): Promise<void> {
    if (isApiCase(testCase)) {
        const runner = new MarkdownApiTestRunner();
        if (testCase.mode === 'real') await runner.runReal(request, testCase);
        else {
            if (!page) throw new Error(`Mock API case "${testCase.title}" requires a browser page to intercept requests.`);
            await runner.runMock(page, testCase);
        }
        return;
    }
    if (!page) throw new Error(`Browser case "${testCase.title}" requires a browser page.`);
    await new TestSpecRunner().run(page, testCase as TestSpec);
}
