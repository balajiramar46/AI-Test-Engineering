import { Page } from '@playwright/test';

/** Page Object Model for product search, product selection, and cart actions. */
export class ProductSearchPage {
    constructor(private readonly page: Page) {}

    async searchFor(product: string): Promise<void> {
        await this.page.getByRole('searchbox', { name: 'Search products' }).fill(product);
        await this.page.getByRole('button', { name: 'Search', exact: true }).click();
    }

    async openProduct(product: string): Promise<void> {
        await this.page.getByRole('button', { name: product, exact: true }).click();
    }

    async addToCart(): Promise<void> {
        await this.page.getByRole('button', { name: 'Add to cart', exact: true }).click();
    }
}
