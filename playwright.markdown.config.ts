import { defineConfig } from '@playwright/test';
import * as path from 'node:path';
import 'dotenv/config';
import { generateMarkdownSpecs } from './src/ai/MarkdownSpecGenerator';

const generatedSpecsDirectory = path.resolve(__dirname, 'generated-tests');
generateMarkdownSpecs(path.resolve(__dirname, 'test-cases'), generatedSpecsDirectory);

/** Runs Markdown-authored cases without starting the local demo web server. */
export default defineConfig({
    testDir: './generated-tests',
    fullyParallel: false,
    reporter: [
        ['line'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['allure-playwright', { resultsDir: 'allure-results', detail: true, suiteTitle: true }]
    ],
    use: {
        browserName: 'chromium',
        baseURL: process.env.APP_BASE_URL,
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure'
    },
    projects: [{
        name: 'chromium',
        use: { browserName: 'chromium', ...(process.env.CI ? {} : { channel: 'chrome' }) }
    }]
});
