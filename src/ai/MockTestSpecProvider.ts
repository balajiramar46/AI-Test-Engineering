import { LLMProvider } from './LLMProvider';

/** Stable local fixture for exercising prompt-to-spec without an API key. */
export class MockTestSpecProvider implements LLMProvider {
    async generate(_prompt: string): Promise<string> {
        return JSON.stringify({
            title: 'Click the Login button',
            instruction: 'Click the Login button on the local button test page',
            url: 'http://127.0.0.1:8081/button.html',
            actions: [
                {
                    action: 'click',
                    target: { category: 'button', text: 'Login' }
                }
            ],
            assertions: [
                { type: 'textVisible', text: 'Login complete' }
            ]
        });
    }
}
