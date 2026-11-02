import { Page } from '@playwright/test';
import { TestAction } from '../models/TestAction';
import { ProductSearchPage } from './ProductSearchPage';

/** Explicit allowlist for calling Page Object methods from Markdown cases. */
export class PageObjectRegistry {
    async run(page: Page, action: TestAction): Promise<void> {
        const pageObject = action.target.pageObject;
        const method = action.target.method;
        if (pageObject !== 'ProductSearchPage') {
            throw new Error(`Unsupported page object: ${pageObject ?? '(missing)'}`);
        }

        const productSearchPage = new ProductSearchPage(page);
        switch (method) {
            case 'searchFor':
                if (!action.inputValue) throw new Error('ProductSearchPage.searchFor requires a product name.');
                await productSearchPage.searchFor(action.inputValue);
                return;
            case 'openProduct':
                if (!action.inputValue) throw new Error('ProductSearchPage.openProduct requires a product name.');
                await productSearchPage.openProduct(action.inputValue);
                return;
            case 'addToCart':
                await productSearchPage.addToCart();
                return;
            default:
                throw new Error(`Unsupported ProductSearchPage method: ${method ?? '(missing)'}`);
        }
    }
}
