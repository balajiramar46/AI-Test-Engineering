import { Page } from '@playwright/test';
import { DiscoveredElement } from '../models/DiscoveredElement';
import { CandidateScore } from '../models/CandidateScore';
import { LocatorStrategy } from '../models/LocatorStrategy';
import { StrategyPriority } from './StrategyPriority';
export class CandidateScoring {
private updateStrongestStrategy(
    current: LocatorStrategy | null,
    candidate: LocatorStrategy
): LocatorStrategy {

    if (!current) {
        return candidate;
    }

    if (
        StrategyPriority.isStronger(
            candidate,
            current
        )
    ) {
        return candidate;
    }

    return current;
}
    async scoreCandidates(
        page: Page,
        candidates: DiscoveredElement[]
    ): Promise<CandidateScore[]> {

        const results: CandidateScore[] = [];

        for (
            let index = 0;
            index < candidates.length;
            index++
        ) {

            const element = candidates[index];

            let score = 0;

            const reasons: string[] = [];

            let strongestStrategy:
                LocatorStrategy | null = null;

            if (element.visible) {

                score += 20;

                reasons.push(
                    'Element is visible (+20)'
                );

            } else {

                score -= 20;

                reasons.push(
                    'Element is hidden (-20)'
                );
            }

            // -----------------------------------------
            // ID
            // -----------------------------------------

            if (element.id) {

                const locator =
                    `#${element.id}`;

                const count =
                    await page
                        .locator(locator)
                        .count();

                if (count === 1) {

                    score += 40;

                    strongestStrategy = 'ID';

                    reasons.push(
                        'Unique ID (+40)'
                    );

                } else if (count > 1) {

                    reasons.push(
                        'ID locator is ambiguous (+0)'
                    );
                }
            }

            // -----------------------------------------
            // NAME
            // -----------------------------------------

            if (element.name) {

                const locator =
                    `[name="${element.name}"]`;

                const count =
                    await page
                        .locator(locator)
                        .count();

                if (count === 1) {

                    score += 30;

                    if (!strongestStrategy) {
                        strongestStrategy = 'NAME';
                    }

                    reasons.push(
                        'Unique name (+30)'
                    );

                } else if (count > 1) {

                    reasons.push(
                        'Name locator is ambiguous (+0)'
                    );
                }
            }

            // -----------------------------------------
            // SUBMIT VALUE
            // -----------------------------------------

            if (
                element.category === 'submit' &&
                element.value
            ) {

                const locator =
                    `input[type="submit"][value="${element.value}"]`;

                const count =
                    await page
                        .locator(locator)
                        .count();

                if (count === 1) {

                    score += 30;

                    if (!strongestStrategy) {
                        strongestStrategy =
                            'SUBMIT VALUE';
                    }

                    reasons.push(
                        'Unique submit value (+30)'
                    );

                } else if (count > 1) {

                    reasons.push(
                        'Submit value locator is ambiguous (+0)'
                    );
                }
            }

            // -----------------------------------------
            // TEXT
            // -----------------------------------------

            if (element.text) {

                const text =
                    element.text.trim();

                if (text.length > 0) {

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

                    const count =
                        await page
                            .locator(locator)
                            .count();

                    if (count === 1) {

                        score += 30;

                        if (!strongestStrategy) {
                            strongestStrategy = 'TEXT';
                        }

                        reasons.push(
                            'Unique element text (+30)'
                        );

                    } else if (count > 1) {

                        reasons.push(
                            'Text locator is ambiguous (+0)'
                        );
                    }
                }
            }

            // -----------------------------------------
            // PLACEHOLDER
            // -----------------------------------------

            if (element.placeholder) {

                const locator =
                    `[placeholder="${element.placeholder}"]`;

                const count =
                    await page
                        .locator(locator)
                        .count();

                if (count === 1) {

                    score += 25;

                    if (!strongestStrategy) {
                        strongestStrategy =
                            'PLACEHOLDER';
                    }

                    reasons.push(
                        'Unique placeholder (+25)'
                    );

                } else if (count > 1) {

                    reasons.push(
                        'Placeholder locator is ambiguous (+0)'
                    );
                }
            }

            // -----------------------------------------
            // ARIA-LABEL
            // -----------------------------------------

            if (element.ariaLabel) {

                const locator =
                    `[aria-label="${element.ariaLabel}"]`;

                const count =
                    await page
                        .locator(locator)
                        .count();

                if (count === 1) {

                    score += 25;

                    if (!strongestStrategy) {
                        strongestStrategy =
                            'ARIA-LABEL';
                    }

                    reasons.push(
                        'Unique aria-label (+25)'
                    );

                } else if (count > 1) {

                    reasons.push(
                        'Aria-label locator is ambiguous (+0)'
                    );
                }
            }

            // -----------------------------------------
            // TITLE
            // -----------------------------------------

            if (element.title) {

                const locator =
                    `[title="${element.title}"]`;

                const count =
                    await page
                        .locator(locator)
                        .count();

                if (count === 1) {

                    score += 20;

                    if (!strongestStrategy) {
                        strongestStrategy =
                            'TITLE';
                    }

                    reasons.push(
                        'Unique title (+20)'
                    );

                } else if (count > 1) {

                    reasons.push(
                        'Title locator is ambiguous (+0)'
                    );
                }
            }

            // -----------------------------------------
            // Confidence
            // -----------------------------------------

            let confidence:
                'HIGH' |
                'MEDIUM' |
                'LOW';

            if (
                strongestStrategy === 'ID'
            ) {

                confidence = 'HIGH';

            } else if (
                strongestStrategy === 'NAME'
            ) {

                confidence = 'HIGH';

            } else if (
                strongestStrategy
            ) {

                confidence = 'HIGH';

            } else if (
                score >= 40
            ) {

                confidence = 'MEDIUM';

            } else {

                confidence = 'LOW';
            }

            results.push({

                index,

                score,

                confidence,

                locator: null,

                reasons,

                strongestStrategy
            });
        }

        return results;
    }
}