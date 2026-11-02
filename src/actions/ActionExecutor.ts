import { Page } from '@playwright/test';

const debugLog = (...args: unknown[]): void => {
    if (process.env.FRAMEWORK_DEBUG === '1') console.log(...args);
};

export class ActionExecutor {

    async pressKey(
        page: Page,
        key: string
    ): Promise<void> {
        debugLog(`Executing KEY PRESS: ${key}`);
        await page.keyboard.press(key);
    }

    async click(
        page: Page,
        locator: string
    ): Promise<void> {

        debugLog(
            'Executing CLICK:',
            locator
        );

        await page.locator(locator).click();

        debugLog(
            'CLICK completed successfully'
        );
    }


    async fill(
        page: Page,
        locator: string,
        value: string
    ): Promise<void> {

        debugLog(
            `Executing FILL: ${locator} = "${value}"`
        );

        await page.locator(locator).fill(value);

        debugLog(
            'FILL completed successfully'
        );
    }


    async check(
        page: Page,
        locator: string
    ): Promise<void> {

        debugLog(
            'Executing CHECK:',
            locator
        );

        await page.locator(locator).check();

        debugLog(
            'CHECK completed successfully'
        );
    }


    async uncheck(
        page: Page,
        locator: string
    ): Promise<void> {

        debugLog(
            'Executing UNCHECK:',
            locator
        );

        await page.locator(locator).uncheck();

        debugLog(
            'UNCHECK completed successfully'
        );
    }


    async select(
        page: Page,
        locator: string,
        value: string
    ): Promise<void> {

        debugLog(
            `Executing SELECT: ${locator} = "${value}"`
        );

        await page
            .locator(locator)
            .selectOption(value);

        debugLog(
            'SELECT completed successfully'
        );
    }
}
