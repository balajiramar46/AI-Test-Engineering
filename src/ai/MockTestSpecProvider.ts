import { LLMProvider } from './LLMProvider';
import { DiscoveredElement } from '../models/DiscoveredElement';

/** Stable local fixture for exercising prompt-to-spec without an API key. */
export class MockTestSpecProvider implements LLMProvider {
    async generate(prompt: string): Promise<string> {
        const url = prompt.match(/^Caller app URL: (.+)$/m)?.[1];
        const context = prompt.match(/^Discovered page context \(JSON\): (.*)$/m)?.[1];
        let elements: DiscoveredElement[] = [];
        if (context) {
            try {
                elements = JSON.parse(context) as DiscoveredElement[];
            } catch {
                elements = [];
            }
        }

        const button = elements.find(element =>
            element.visible && ['button', 'submit-button', 'submit'].includes(element.category)
        );
        return JSON.stringify({
            title: 'Click the Login button',
            instruction: 'Click the Login button on the local button test page',
            url: url && url !== 'not supplied' ? url : 'http://127.0.0.1:8081/button.html',
            actions: [
                {
                    action: 'click',
                    target: button
                        ? { category: button.category, ...(button.text ? { text: button.text } : {}), ...(button.id ? { id: button.id } : {}), ...(button.name ? { name: button.name } : {}) }
                        : { category: 'button', text: 'Login' }
                }
            ],
            assertions: [
                { type: 'textVisible', text: 'Login complete' }
            ]
        });
    }
}
