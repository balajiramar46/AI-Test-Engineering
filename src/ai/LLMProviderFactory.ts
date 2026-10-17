import { LLMProvider } from './LLMProvider';
import { MockLLMProvider } from './MockLLMProvider';
import { OpenAIProvider } from './OpenAIProvider';

export class LLMProviderFactory {

    static create(
        providerName: string
    ): LLMProvider {

        switch (providerName.toLowerCase()) {

            case 'mock':
                return new MockLLMProvider();

            case 'openai':
                return new OpenAIProvider();

            default:
                throw new Error(
                    `Unsupported LLM provider: ${providerName}`
                );
        }
    }
}