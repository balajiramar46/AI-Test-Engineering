import { Page } from '@playwright/test';

import { DiscoveredElement } from '../models/DiscoveredElement';
import { LocatorResult } from '../models/LocatorResult';
import { LocatorStrategy } from '../models/LocatorStrategy';

import { LOCATOR_STRATEGY_PRIORITY } from './LocatorStrategyConfig';

const debugLog = (...args: unknown[]): void => {
    if (process.env.FRAMEWORK_DEBUG === '1') console.log(...args);
};

export class LocatorIntelligence {

    getStrategyPriority(): readonly LocatorStrategy[] {
        return LOCATOR_STRATEGY_PRIORITY;
    }

    async findBestLocator(
        page: Page,
        element: DiscoveredElement
    ): Promise<LocatorResult | null> {

        for (
            const strategy
            of LOCATOR_STRATEGY_PRIORITY
        ) {

            const result =
                await this.tryStrategy(
                    page,
                    element,
                    strategy
                );

            if (result) {
                return result;
            }
        }

        debugLog(
            'Locator strategy: NONE'
        );

        return null;
    }

    private async tryStrategy(
        page: Page,
        element: DiscoveredElement,
        strategy: LocatorStrategy
    ): Promise<LocatorResult | null> {

        switch (strategy) {

            case 'ID':
                return await this.tryId(
                    page,
                    element
                );

            case 'NAME':
                return await this.tryName(
                    page,
                    element
                );

            case 'SUBMIT VALUE':
                return await this.trySubmitValue(
                    page,
                    element
                );

            case 'TEXT':
                return await this.tryText(
                    page,
                    element
                );

            case 'PLACEHOLDER':
                return await this.tryPlaceholder(
                    page,
                    element
                );

            case 'ARIA-LABEL':
                return await this.tryAriaLabel(
                    page,
                    element
                );

            case 'TITLE':
                return await this.tryTitle(
                    page,
                    element
                );

            case 'FORM CONTEXT + ID':
                return await this.tryFormContextId(
                    page,
                    element
                );

            case 'FORM CONTEXT + NAME':
                return await this.tryFormContextName(
                    page,
                    element
                );

            case 'NONE':
                return null;
        }
    }

    private async tryId(
        page: Page,
        element: DiscoveredElement
    ): Promise<LocatorResult | null> {

        if (!element.id) {
            return null;
        }

        const locator =
            `#${element.id}`;

        return this.uniqueLocator(page, locator, 'ID', 'ID');
    }

    private async tryName(
        page: Page,
        element: DiscoveredElement
    ): Promise<LocatorResult | null> {

        if (!element.name) {
            return null;
        }

        const locator =
            `[name="${element.name}"]`;

        return this.uniqueLocator(page, locator, 'NAME', 'name');
    }

    private async trySubmitValue(
        page: Page,
        element: DiscoveredElement
    ): Promise<LocatorResult | null> {

        if (
            element.category !== 'submit' ||
            !element.value
        ) {
            return null;
        }

        const locator =
            `input[type="submit"][value="${element.value}"]`;

        return this.uniqueLocator(page, locator, 'SUBMIT VALUE', 'submit value');
    }

    private async tryText(
        page: Page,
        element: DiscoveredElement
    ): Promise<LocatorResult | null> {

        if (!element.text) {
            return null;
        }

        const text =
            element.text.trim();

        if (!text) {
            return null;
        }

        let locator: string;

        if (element.tag === 'button') {

            locator =
                `button:has-text("${text}")`;

        } else if (element.tag === 'a') {

            locator =
                `a:has-text("${text}")`;

        } else {

            locator =
                `${element.tag}:has-text("${text}")`;
        }

        return this.uniqueLocator(page, locator, 'TEXT', 'element text');
    }

    private async tryPlaceholder(
        page: Page,
        element: DiscoveredElement
    ): Promise<LocatorResult | null> {

        if (!element.placeholder) {
            return null;
        }

        const locator =
            `[placeholder="${element.placeholder}"]`;

        return this.uniqueLocator(page, locator, 'PLACEHOLDER', 'placeholder');
    }

    private async tryAriaLabel(
        page: Page,
        element: DiscoveredElement
    ): Promise<LocatorResult | null> {

        if (!element.ariaLabel) {
            return null;
        }

        const locator =
            `[aria-label="${element.ariaLabel}"]`;

        return this.uniqueLocator(page, locator, 'ARIA-LABEL', 'aria-label');
    }

    private async tryTitle(
        page: Page,
        element: DiscoveredElement
    ): Promise<LocatorResult | null> {

        if (!element.title) {
            return null;
        }

        const locator =
            `[title="${element.title}"]`;

        return this.uniqueLocator(page, locator, 'TITLE', 'title');
    }

    /** Prefer a unique attribute match; if duplicate matches include hidden controls, scope to the one visible match. */
    private async uniqueLocator(
        page: Page,
        locator: string,
        strategy: LocatorStrategy,
        description: string
    ): Promise<LocatorResult | null> {
        const count = await page.locator(locator).count();
        if (count === 1) {
            debugLog(`Locator strategy: ${strategy}`);
            return {
                locator,
                strategy,
                confidence: 'HIGH',
                reason: `Unique ${description}`
            };
        }

        if (count > 1) {
            const visibleLocator = `${locator}:visible`;
            const visibleCount = await page.locator(visibleLocator).count();
            if (visibleCount === 1) {
                debugLog(`Locator strategy: ${strategy} (visible match)`);
                return {
                    locator: visibleLocator,
                    strategy,
                    confidence: 'MEDIUM',
                    reason: `Unique visible ${description}`
                };
            }
            debugLog(`${description} locator is ambiguous`);
        }

        return null;
    }

    private async tryFormContextId(
        page: Page,
        element: DiscoveredElement
    ): Promise<LocatorResult | null> {

        if (element.category !== 'submit') {
            return null;
        }

        const submits =
            page.locator(
                'input[type="submit"]'
            );

        const submitCount =
            await submits.count();

        for (
            let i = 0;
            i < submitCount;
            i++
        ) {

            const submit =
                submits.nth(i);

            const value =
                await submit.getAttribute(
                    'value'
                );

            if (value !== element.value) {
                continue;
            }

            const form =
                submit.locator(
                    'xpath=ancestor::form[1]'
                );

            const formCount =
                await form.count();

            if (formCount !== 1) {
                continue;
            }

            const idElements =
                form.locator('[id]');

            const idCount =
                await idElements.count();

            for (
                let j = 0;
                j < idCount;
                j++
            ) {

                const child =
                    idElements.nth(j);

                const childId =
                    await child.getAttribute(
                        'id'
                    );

                if (!childId) {
                    continue;
                }

                const locator =
                    `form:has(#${childId}) >> input[type="submit"]`;

                const count =
                    await page.locator(
                        locator
                    ).count();

                if (count === 1) {

                    debugLog(
                        'Locator strategy: FORM CONTEXT + ID'
                    );

                    return {
                        locator,
                        strategy:
                            'FORM CONTEXT + ID',
                        confidence: 'HIGH',
                        reason:
                            `Submit identified using unique form child ID: ${childId}`
                    };
                }
            }
        }

        return null;
    }

    private async tryFormContextName(
        page: Page,
        element: DiscoveredElement
    ): Promise<LocatorResult | null> {

        if (element.category !== 'submit') {
            return null;
        }

        const submits =
            page.locator(
                'input[type="submit"]'
            );

        const submitCount =
            await submits.count();

        for (
            let i = 0;
            i < submitCount;
            i++
        ) {

            const submit =
                submits.nth(i);

            const value =
                await submit.getAttribute(
                    'value'
                );

            if (value !== element.value) {
                continue;
            }

            const form =
                submit.locator(
                    'xpath=ancestor::form[1]'
                );

            const formCount =
                await form.count();

            if (formCount !== 1) {
                continue;
            }

            const nameElements =
                form.locator('[name]');

            const nameCount =
                await nameElements.count();

            for (
                let j = 0;
                j < nameCount;
                j++
            ) {

                const child =
                    nameElements.nth(j);

                const childName =
                    await child.getAttribute(
                        'name'
                    );

                if (!childName) {
                    continue;
                }

                const locator =
                    `form:has([name="${childName}"]) >> input[type="submit"]`;

                const count =
                    await page.locator(
                        locator
                    ).count();

                if (count === 1) {

                    debugLog(
                        'Locator strategy: FORM CONTEXT + NAME'
                    );

                    return {
                        locator,
                        strategy:
                            'FORM CONTEXT + NAME',
                        confidence: 'HIGH',
                        reason:
                            `Submit identified using unique form child name: ${childName}`
                    };
                }
            }
        }

        return null;
    }
}
