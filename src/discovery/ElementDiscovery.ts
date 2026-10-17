
import { Page } from '@playwright/test';
import { DiscoveredElement } from '../models/DiscoveredElement';
import { ElementTarget } from '../models/ElementTarget';

export class ElementDiscovery {

    async scan(
        page: Page
    ): Promise<DiscoveredElement[]> {

        return await page.locator(
            'input, button, textarea, select, a'
        ).evaluateAll(elements => {

            return elements.map(element => {

                const htmlElement =
                    element as HTMLElement;

                const inputElement =
                    element as HTMLInputElement;

                const tag =
                    element.tagName.toLowerCase();

                const type =
                    element.getAttribute('type');

                let category = 'unknown';

                // -----------------------------------------
                // Element Classification
                // -----------------------------------------

                if (tag === 'input') {

                    if (
                        type === 'text' ||
                        type === 'password' ||
                        type === 'email' ||
                        type === 'search' ||
                        type === 'tel' ||
                        type === 'url' ||
                        type === 'number' ||
                        type === null
                    ) {
                        category = 'input';
                    }

                    else if (type === 'checkbox') {
                        category = 'checkbox';
                    }

                    else if (type === 'radio') {
                        category = 'radio';
                    }

                    else if (type === 'submit') {
                        category = 'submit';
                    }

                    else if (type === 'button') {
                        category = 'button';
                    }
                }

                else if (tag === 'button') {

                    if (type === 'submit') {
                        category = 'submit-button';
                    } else {
                        category = 'button';
                    }
                }

                else if (tag === 'a') {
                    category = 'link';
                }

                else if (tag === 'textarea') {
                    category = 'text-area';
                }

                else if (tag === 'select') {
                    category = 'dropdown';
                }

                // -----------------------------------------
                // Visibility
                // -----------------------------------------

                const rect =
                    htmlElement.getBoundingClientRect();

                const style =
                    window.getComputedStyle(htmlElement);

                const visible =
                    style.display !== 'none' &&
                    style.visibility !== 'hidden' &&
                    style.opacity !== '0' &&
                    rect.width > 0 &&
                    rect.height > 0;

                // -----------------------------------------
                // Return Discovered Element
                // -----------------------------------------

                return {

                    tag,

                    type,

                    category,

                    id:
                        element.getAttribute('id'),

                    name:
                        element.getAttribute('name'),

                    text:
                        htmlElement.textContent?.trim(),

                    value:
                        inputElement.value || null,

                    placeholder:
                        element.getAttribute('placeholder'),

                    ariaLabel:
                        element.getAttribute('aria-label'),

                    title:
                        element.getAttribute('title'),

                    visible
                };
            });
        });
    }

    // =========================================
    // Find By Category
    // =========================================

    async findByCategory(
        page: Page,
        category: string
    ): Promise<DiscoveredElement[]> {

        const elements =
            await this.scan(page);

        return elements.filter(
            element => element.category === category
        );
    }

    // =========================================
    // Find By Target
    // =========================================

    async findByTarget(
        page: Page,
        target: ElementTarget
    ): Promise<DiscoveredElement[]> {

        const elements =
            await this.scan(page);

        return elements.filter(element => {

            // Category
            if (
                target.category &&
                element.category !== target.category
            ) {
                return false;
            }

            // Text
            if (
                target.text &&
                element.text !== target.text
            ) {
                return false;
            }

            // Value
            if (
                target.value &&
                element.value !== target.value
            ) {
                return false;
            }

            // ID
            if (
                target.id &&
                element.id !== target.id
            ) {
                return false;
            }

            // Name
            if (
                target.name &&
                element.name !== target.name
            ) {
                return false;
            }

            // Placeholder
            if (
                target.placeholder &&
                element.placeholder !== target.placeholder
            ) {
                return false;
            }

            // ARIA label
            if (
                target.ariaLabel &&
                element.ariaLabel !== target.ariaLabel
            ) {
                return false;
            }

            // Title
            if (
                target.title &&
                element.title !== target.title
            ) {
                return false;
            }

            return true;
        });
    }
}
