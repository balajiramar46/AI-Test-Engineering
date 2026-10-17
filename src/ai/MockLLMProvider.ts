
import { LLMProvider } from './LLMProvider';

export class MockLLMProvider implements LLMProvider {
    constructor(
        private readonly username = 'standard_user',
        private readonly password = 'secret_sauce'
    ) {}

    async generate(prompt: string): Promise<string> {
        console.log('Received by Mock LLM Provider:');
        console.log(prompt);

        return JSON.stringify({
            actions: [
                {
                    action: 'fill',
                    target: {
                        category: 'input',
                        id: 'user-name'
                    },
                    inputValue: this.username
                },
                {
                    action: 'fill',
                    target: {
                        category: 'input',
                        id: 'password'
                    },
                    inputValue: this.password
                },
                {
                    action: 'click',
                    target: {
                        category: 'submit',
                        id: 'login-button'
                    }
                }
            ]
        });
    }
}
