import OpenAI from 'openai';
import { LLMProvider } from './LLMProvider';

export class OpenAIProvider implements LLMProvider {

    private client: OpenAI;

    constructor() {

        const apiKey =
            process.env['OPENAI_API_KEY'];

        if (!apiKey) {
            throw new Error(
                'OPENAI_API_KEY is not configured.'
            );
        }

        this.client = new OpenAI({
            apiKey
        });
    }

    async generate(
        prompt: string
    ): Promise<string> {

        console.log('========================================');
        console.log('OPENAI PROVIDER');
        console.log('========================================');
        console.log('Sending request to OpenAI...');

        const response =
            await this.client.responses.create({
                model: 'gpt-5.5',
                input: prompt
            });

        console.log('OpenAI response received.');

        return response.output_text;
    }
}