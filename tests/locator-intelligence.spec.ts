import { test, expect } from '@playwright/test';

import { LocatorIntelligence } from '../src/locator/LocatorIntelligence';
import { DiscoveredElement } from '../src/models/DiscoveredElement';

test('should generate locator using ID', async ({ page }) => {

    await page.goto(
        'http://127.0.0.1:8081/competing.html'
    );

    const element: DiscoveredElement = {

        tag: 'button',
        type: null,
        category: 'button',

        id: 'loginButton',
        name: null,

        text: 'Login',
        value: null,

        placeholder: null,
        ariaLabel: null,
        title: null,

        visible: true
    };

    const engine =
        new LocatorIntelligence();

    const result =
        await engine.findBestLocator(
            page,
            element
        );

    expect(result).not.toBeNull();

    expect(result!.locator)
        .toBe('#loginButton');

    expect(result!.strategy)
        .toBe('ID');

    expect(result!.confidence)
        .toBe('HIGH');

    expect(result!.reason)
        .toBe('Unique ID');

    console.log(
        'Locator result:',
        result
    );
    
});
test('should generate locator using NAME', async ({ page }) => {

    await page.goto(
        'http://127.0.0.1:8081/dropdown.html'
    );

    const element: DiscoveredElement = {

        tag: 'select',
        type: null,
        category: 'dropdown',

        id: null,
        name: 'vehicle',

        text: '-- Select --VolvoSaabMercedesAudi',
        value: null,

        placeholder: null,
        ariaLabel: null,
        title: null,

        visible: true
    };

    const engine =
        new LocatorIntelligence();

    const result =
        await engine.findBestLocator(
            page,
            element
        );

    expect(result).not.toBeNull();

    expect(result!.locator)
        .toBe('[name="vehicle"]');

    expect(result!.strategy)
        .toBe('NAME');

    expect(result!.confidence)
        .toBe('HIGH');

    expect(result!.reason)
        .toBe('Unique name');

    console.log(
        'Locator result:',
        result
    );
});
test('should generate locator using TEXT', async ({ page }) => {

    await page.goto(
        'http://127.0.0.1:8081/button.html'
    );

    const element: DiscoveredElement = {

        tag: 'button',
        type: null,
        category: 'button',

        id: null,
        name: null,

        text: 'Login',
        value: null,

        placeholder: null,
        ariaLabel: null,
        title: null,

        visible: true
    };

    const engine =
        new LocatorIntelligence();

    const result =
        await engine.findBestLocator(
            page,
            element
        );

    expect(result).not.toBeNull();

    expect(result!.locator)
        .toBe('button:has-text("Login")');

    expect(result!.strategy)
        .toBe('TEXT');

    expect(result!.confidence)
        .toBe('HIGH');

    expect(result!.reason)
        .toBe('Unique element text');

    console.log(
        'Locator result:',
        result
    );
});
test('should generate locator using PLACEHOLDER', async ({ page }) => {

    await page.goto(
        'http://127.0.0.1:8081/placeholder.html'
    );

    const element: DiscoveredElement = {

        tag: 'input',
        type: 'text',
        category: 'text-field',

        id: null,
        name: null,

        text: '',
        value: null,

        placeholder: 'Enter username',
        ariaLabel: null,
        title: null,

        visible: true
    };

    const engine =
        new LocatorIntelligence();

    const result =
        await engine.findBestLocator(
            page,
            element
        );

    expect(result).not.toBeNull();

    expect(result!.locator)
        .toBe('[placeholder="Enter username"]');

    expect(result!.strategy)
        .toBe('PLACEHOLDER');

    expect(result!.confidence)
        .toBe('HIGH');

    expect(result!.reason)
        .toBe('Unique placeholder');

    console.log(
        'Locator result:',
        result
    );
});
test('should generate locator using ARIA-LABEL', async ({ page }) => {

    await page.goto(
        'http://127.0.0.1:8081/aria-label.html'
    );

    const element: DiscoveredElement = {

        tag: 'input',
        type: 'text',
        category: 'text-field',

        id: null,
        name: null,

        text: '',
        value: null,

        placeholder: null,
        ariaLabel: 'Username',
        title: null,

        visible: true
    };

    const engine =
        new LocatorIntelligence();

    const result =
        await engine.findBestLocator(
            page,
            element
        );

    expect(result).not.toBeNull();

    expect(result!.locator)
        .toBe('[aria-label="Username"]');

    expect(result!.strategy)
        .toBe('ARIA-LABEL');

    expect(result!.confidence)
        .toBe('HIGH');

    expect(result!.reason)
        .toBe('Unique aria-label');

    console.log(
        'Locator result:',
        result
    );
});
test('should generate locator using TITLE', async ({ page }) => {

    await page.goto(
        'http://127.0.0.1:8081/title.html'
    );

    const element: DiscoveredElement = {

        tag: 'input',
        type: 'text',
        category: 'text-field',

        id: null,
        name: null,

        text: '',
        value: null,

        placeholder: null,
        ariaLabel: null,
        title: 'Username Field',

        visible: true
    };

    const engine =
        new LocatorIntelligence();

    const result =
        await engine.findBestLocator(
            page,
            element
        );

    expect(result).not.toBeNull();

    expect(result!.locator)
        .toBe('[title="Username Field"]');

    expect(result!.strategy)
        .toBe('TITLE');

    expect(result!.confidence)
        .toBe('HIGH');

    expect(result!.reason)
        .toBe('Unique title');

    console.log(
        'Locator result:',
        result
    );
});
test('should generate locator using SUBMIT VALUE', async ({ page }) => {

    await page.goto(
        'http://127.0.0.1:8081/submit.html'
    );

    console.log(
        'Submit count:',
        await page
            .locator('input[type="submit"]')
            .count()
    );

    console.log(
        'Submit values:',
        await page
            .locator('input[type="submit"]')
            .evaluateAll(elements =>
                elements.map(
                    element =>
                        (element as HTMLInputElement).value
                )
            )
    );

    const element: DiscoveredElement = {

        tag: 'input',
        type: 'submit',
        category: 'submit',

        id: null,
        name: null,

        text: '',
        value: 'Login',

        placeholder: null,
        ariaLabel: null,
        title: null,

        visible: true
    };

    const engine =
        new LocatorIntelligence();

    const result =
        await engine.findBestLocator(
            page,
            element
        );

    console.log(
        'Actual locator result:',
        result
    );

    expect(result).not.toBeNull();

    expect(result!.locator)
        .toBe(
            'input[type="submit"][value="Login"]'
        );

    expect(result!.strategy)
        .toBe('SUBMIT VALUE');

    expect(result!.confidence)
        .toBe('HIGH');

    expect(result!.reason)
        .toBe('Unique submit value');
});
test('should generate locator using FORM CONTEXT + ID', async ({ page }) => {

    await page.goto(
        'http://127.0.0.1:8081/form-context.html'
    );

    console.log(
        'Submit count:',
        await page
            .locator('input[type="submit"]')
            .count()
    );

    const element: DiscoveredElement = {

        tag: 'input',
        type: 'submit',
        category: 'submit',

        id: null,
        name: null,

        text: '',
        value: 'Login',

        placeholder: null,
        ariaLabel: null,
        title: null,

        visible: true
    };

    const engine =
        new LocatorIntelligence();

    const result =
        await engine.findBestLocator(
            page,
            element
        );

    console.log(
        'Actual locator result:',
        result
    );

    expect(result).not.toBeNull();

    expect(result!.strategy)
        .toBe('FORM CONTEXT + ID');

    expect(result!.confidence)
        .toBe('HIGH');

    expect(result!.locator)
        .toBe(
            'form:has(#username) >> input[type="submit"]'
        );

    expect(result!.reason)
        .toBe(
            'Submit identified using unique form child ID: username'
        );
});
test('should generate locator using FORM CONTEXT + NAME', async ({ page }) => {

    await page.goto(
        'http://127.0.0.1:8081/form-context-name.html'
    );

    console.log(
        'Submit count:',
        await page
            .locator('input[type="submit"]')
            .count()
    );

    const element: DiscoveredElement = {

        tag: 'input',
        type: 'submit',
        category: 'submit',

        id: null,
        name: null,

        text: '',
        value: 'Login',

        placeholder: null,
        ariaLabel: null,
        title: null,

        visible: true
    };

    const engine =
        new LocatorIntelligence();

    const result =
        await engine.findBestLocator(
            page,
            element
        );

    console.log(
        'Actual locator result:',
        result
    );

    expect(result).not.toBeNull();

    expect(result!.strategy)
        .toBe('FORM CONTEXT + NAME');

    expect(result!.confidence)
        .toBe('HIGH');

    expect(result!.locator)
        .toBe(
            'form:has([name="username"]) >> input[type="submit"]'
        );

    expect(result!.reason)
        .toBe(
            'Submit identified using unique form child name: username'
        );
});
test('should return null for ambiguous TEXT locator', async ({ page }) => {

    await page.goto(
        'http://127.0.0.1:8081/ambiguous.html'
    );

    const element: DiscoveredElement = {

        tag: 'button',
        type: null,
        category: 'button',

        id: null,
        name: null,

        text: 'Login',
        value: null,

        placeholder: null,
        ariaLabel: null,
        title: null,

        visible: true
    };

    const engine =
        new LocatorIntelligence();

    const result =
        await engine.findBestLocator(
            page,
            element
        );

    console.log(
        'Ambiguous locator result:',
        result
    );

    expect(result).toBeNull();
});