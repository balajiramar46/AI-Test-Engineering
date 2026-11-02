import { APIRequestContext, Page, expect } from '@playwright/test';
import { MarkdownApiTestCase } from '../ai/TestSpecSchema';

/** Executes an API case from Markdown against its declared deterministic mock response. */
export class MarkdownApiTestRunner {
    async runMock(page: Page, testCase: MarkdownApiTestCase): Promise<void> {
        if (testCase.mockStatus === undefined || testCase.mockBody === undefined) {
            throw new Error(`API case "${testCase.title}" is in mock mode but has no mock response.`);
        }
        const targetUrl = new URL(testCase.url);
        const origin = targetUrl.origin;

        await page.route(`${origin}/**`, async route => {
            const requestUrl = new URL(route.request().url());
            if (requestUrl.href === testCase.url && route.request().method() === testCase.method) {
                await route.fulfill({
                    status: testCase.mockStatus,
                    contentType: 'application/json',
                    json: testCase.mockBody
                });
                return;
            }
            if (requestUrl.origin === origin && requestUrl.pathname === '/') {
                await route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>API test</title>' });
                return;
            }
            await route.fulfill({ status: 404, contentType: 'application/json', json: { message: 'No mock response configured' } });
        });

        await page.goto(origin);
        const result = await page.evaluate(async ({ url, method, body, headers }) => {
            const response = await fetch(url, {
                method,
                ...(body === undefined ? {} : {
                    headers: { ...headers, 'content-type': 'application/json' },
                    body: JSON.stringify(body)
                })
            });
            return { status: response.status, body: await response.json() };
        }, { url: testCase.url, method: testCase.method, body: testCase.requestBody, headers: testCase.headers });

        this.assertResponse(testCase, result.status, result.body);
    }

    async runReal(request: APIRequestContext, testCase: MarkdownApiTestCase): Promise<void> {
        let response;
        try {
            response = await request.fetch(testCase.url, {
                method: testCase.method,
                headers: testCase.headers,
                ...(testCase.requestBody === undefined ? {} : { data: testCase.requestBody })
            });
        } catch (error) {
            throw new Error(`API case "${testCase.title}" failed to send ${testCase.method} ${testCase.url}: ${String(error)}`);
        }

        let body: unknown;
        try {
            const responseText = await response.text();
            if (responseText.length === 0) {
                body = undefined;
            } else {
                try { body = JSON.parse(responseText); }
                catch {
                    if (testCase.expectedJson.length > 0) throw new Error('The response body is not valid JSON.');
                    body = responseText;
                }
            }
        } catch (error) {
            throw new Error(`API case "${testCase.title}" could not read its response body: ${String(error)}`);
        }
        this.assertResponse(testCase, response.status(), body);
    }

    private assertResponse(testCase: MarkdownApiTestCase, status: number, body: unknown): void {
        try {
            expect(status, `API case "${testCase.title}" response status`).toBe(testCase.expectedStatus);
            for (const assertion of testCase.expectedJson) {
                const value = assertion.path.split('.').reduce<unknown>((current, key) => {
                    if (!current || typeof current !== 'object') return undefined;
                    return (current as Record<string, unknown>)[key];
                }, body);

                if (assertion.operator === 'contains') {
                    expect(String(value), `JSON field ${assertion.path}`).toContain(String(assertion.value));
                } else {
                    expect(value, `JSON field ${assertion.path}`).toEqual(assertion.value);
                }
            }
        } catch (error) {
            throw new Error(`API case "${testCase.title}" response validation failed: ${String(error)}`);
        }
    }
}
