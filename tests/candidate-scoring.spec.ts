import { test, expect } from '@playwright/test';

import { CandidateScoring } from '../src/locator/CandidateScoring';
import { DiscoveredElement } from '../src/models/DiscoveredElement';

test('should calculate candidate score using ID evidence', async ({ page }) => {

    await page.goto(
        'http://127.0.0.1:8081/competing.html'
    );

    const elements: DiscoveredElement[] = [

        {
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
        }
    ];

    const scoring =
        new CandidateScoring();

    const results =
        await scoring.scoreCandidates(
            page,
            elements
        );

    expect(results).toHaveLength(1);

    const result =
        results[0];

    console.log(
        'Scoring result:',
        result
    );

    expect(result.score)
        .toBe(60);

    expect(result.confidence)
        .toBe('HIGH');

    expect(result.strongestStrategy)
        .toBe('ID');

    /*
     * CandidateScoring should NOT
     * generate the actual locator.
     */
    expect(result.locator)
        .toBeNull();
});
test('should not score ambiguous TEXT as locator evidence', async ({ page }) => {

    await page.goto(
        'http://127.0.0.1:8081/ambiguous.html'
    );

    const elements: DiscoveredElement[] = [

        {
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
        }
    ];

    const scoring =
        new CandidateScoring();

    const results =
        await scoring.scoreCandidates(
            page,
            elements
        );

    expect(results).toHaveLength(1);

    const result =
        results[0];

    console.log(
        'Ambiguous scoring result:',
        result
    );

    // Only visibility contributes
    expect(result.score)
        .toBe(20);

    expect(result.strongestStrategy)
        .toBeNull();

    expect(result.confidence)
        .toBe('LOW');

    expect(result.locator)
        .toBeNull();
});