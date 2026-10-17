import { Page } from '@playwright/test';

export class ActionExecutor {

    async click(
        page: Page,
        locator: string
    ): Promise<void> {

        console.log(
            'Executing CLICK:',
            locator
        );

        await page.locator(locator).click();

        console.log(
            'CLICK completed successfully'
        );
    }


    async fill(
        page: Page,
        locator: string,
        value: string
    ): Promise<void> {

        console.log(
            `Executing FILL: ${locator} = "${value}"`
        );

        await page.locator(locator).fill(value);

        console.log(
            'FILL completed successfully'
        );
    }


    async check(
        page: Page,
        locator: string
    ): Promise<void> {

        console.log(
            'Executing CHECK:',
            locator
        );

        await page.locator(locator).check();

        console.log(
            'CHECK completed successfully'
        );
    }


    async uncheck(
        page: Page,
        locator: string
    ): Promise<void> {

        console.log(
            'Executing UNCHECK:',
            locator
        );

        await page.locator(locator).uncheck();

        console.log(
            'UNCHECK completed successfully'
        );
    }


    async select(
        page: Page,
        locator: string,
        value: string
    ): Promise<void> {

        console.log(
            `Executing SELECT: ${locator} = "${value}"`
        );

        await page
            .locator(locator)
            .selectOption(value);

        console.log(
            'SELECT completed successfully'
        );
    }
}