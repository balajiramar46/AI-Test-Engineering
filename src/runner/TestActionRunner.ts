import { Page, expect } from '@playwright/test';

import { ElementDiscovery } from '../discovery/ElementDiscovery';
import { LocatorIntelligence } from '../locator/LocatorIntelligence';
import { CandidateScoring } from '../locator/CandidateScoring';
import { CandidateSelector } from '../locator/CandidateSelector';
import { ActionExecutor } from '../actions/ActionExecutor';
import { TestAction } from '../models/TestAction';
import { PageObjectRegistry } from '../pages/PageObjectRegistry';
import { SelfHealingLocator } from '../locator/SelfHealingLocator';


const debugLog = (...args: unknown[]): void => {
    if (process.env.FRAMEWORK_DEBUG === '1') console.log(...args);
};

export class TestActionRunner {

    private discovery: ElementDiscovery;
    private scoringEngine: CandidateScoring;
    private selector: CandidateSelector;
    private locatorEngine: LocatorIntelligence;
    private executor: ActionExecutor;
    private pageObjects: PageObjectRegistry;
    private selfHealingLocator: SelfHealingLocator;


    constructor() {

        this.discovery = new ElementDiscovery();

        this.scoringEngine = new CandidateScoring();

        this.selector = new CandidateSelector();

        this.locatorEngine = new LocatorIntelligence();

        this.executor = new ActionExecutor();
        this.pageObjects = new PageObjectRegistry();
        this.selfHealingLocator = new SelfHealingLocator();
    }


    async run(
        page: Page,
        testAction: TestAction
    ): Promise<void> {

        const actionName = testAction.action === 'pageObject'
            ? `${testAction.target.pageObject ?? 'PageObject'}.${testAction.target.method ?? 'unknown'}`
            : testAction.action;
        console.log(`Action: ${actionName}`);

        if (testAction.action === 'pageObject') {
            await this.pageObjects.run(page, testAction);
            console.log('Action completed');
            return;
        }

        if (testAction.action === 'press') {
            if (!testAction.inputValue) {
                throw new Error('Press action requires a key in inputValue');
            }
            await this.executor.pressKey(page, testAction.inputValue);
            console.log('Action completed');
            return;
        }


        // -----------------------------------------
        // 1. Targeted Discovery
        // -----------------------------------------

        const candidates =
            await this.discovery.findByTarget(
                page,
                testAction.target
            );


        debugLog(
            'Matching candidates:',
            candidates.length
        );


        candidates.forEach(
            (element, index) => {

                debugLog(
                    `Candidate ${index}:`,
                    element
                );

            }
        );


        // -----------------------------------------
        // 2. No Candidate
        // -----------------------------------------

        if (candidates.length === 0) {

            throw new Error(
                `No elements found for target: ${JSON.stringify(testAction.target)}`
            );
        }


        // -----------------------------------------
        // 3. Score Candidates
        // -----------------------------------------

        const scores =
            await this.scoringEngine.scoreCandidates(
                page,
                candidates,
                testAction.target.intent
            );


        debugLog(
            'Candidate scores:'
        );


        scores.forEach(result => {

            debugLog(
                `Candidate ${result.index}:`,
                result
            );

        });


        // -----------------------------------------
        // 4. Select Best Candidate
        // -----------------------------------------

        const bestCandidate =
            this.selector.selectBest(scores);


        debugLog(
            'Best candidate:',
            bestCandidate
        );


        // -----------------------------------------
        // 5. Handle Ambiguity
        // -----------------------------------------

        if (!bestCandidate) {

    debugLog(
        '========================================'
    );

    debugLog(
        'ACTION BLOCKED'
    );

    debugLog(
        '========================================'
    );

    debugLog(
        'Reason: Multiple candidates have the same highest score.'
    );

    debugLog(
        'Target:',
        testAction.target
    );

    debugLog(
        'Candidates:',
        candidates.length
    );

    debugLog(
        'Action was NOT executed.'
    );

    throw new Error(
        `Unable to select a unique best candidate for target: ${JSON.stringify(testAction.target)}`
    );
}
        // -----------------------------------------
        // 6. Get Selected Element
        // -----------------------------------------

        const selectedElement =
            candidates[bestCandidate.index];


        // -----------------------------------------
        // 7. Locator Intelligence
        // -----------------------------------------

        const locatorResult =
            await this.locatorEngine.findBestLocator(
                page,
                selectedElement
            );


        if (!locatorResult) {

            throw new Error(
                `Unable to generate locator for selected element: ${JSON.stringify(selectedElement)}`
            );
        }


        // -----------------------------------------
        // 8. Locator Result
        // -----------------------------------------

        debugLog(
            'Best locator:',
            locatorResult.locator
        );

        debugLog(
            'Locator strategy:',
            locatorResult.strategy
        );

        debugLog(
            'Locator confidence:',
            locatorResult.confidence
        );

        debugLog(
            'Locator reason:',
            locatorResult.reason
        );


        // -----------------------------------------
        // 9. Execute Action
        // -----------------------------------------

        try {
            await this.executeLocatedAction(page, locatorResult.locator, testAction);
        } catch (error) {
            if (!this.isRecoverableLocatorError(error)) throw error;

            const replacement = await this.selfHealingLocator.findReplacement(
                page,
                testAction.target,
                locatorResult.locator
            );

            if (!replacement) throw error;

            console.log('Locator recovery: rediscovered target; retrying action once');
            await this.executeLocatedAction(page, replacement, testAction);
            locatorResult.locator = replacement;
        }

        console.log('Action completed');

        // -----------------------------------------
        // 10. Validate Action
        // -----------------------------------------

        await this.validateAction(
            page,
            locatorResult.locator,
            testAction
        );


        debugLog(
            'Action validation completed successfully'
        );


        debugLog(
            '========================================'
        );
    }

    private isRecoverableLocatorError(error: unknown): boolean {
        const message = error instanceof Error ? error.message : String(error);
        return /strict mode violation|waiting for locator|locator resolved to|element is not visible|element is not attached|detached from the DOM|not attached to the DOM/i.test(message);
    }

    private async executeLocatedAction(
        page: Page,
        locator: string,
        testAction: TestAction
    ): Promise<void> {
        switch (testAction.action) {


            // -------------------------------------
            // CLICK
            // -------------------------------------

            case 'click':

                await this.executor.click(
                    page,
                    locator
                );

                break;


            // -------------------------------------
            // FILL
            // -------------------------------------

            case 'fill':

                if (
                    testAction.inputValue === undefined
                ) {

                    throw new Error(
                        'Fill action requires inputValue'
                    );
                }


                await this.executor.fill(
                    page,
                    locator,
                    testAction.inputValue
                );

                break;


            // -------------------------------------
            // CHECK
            // -------------------------------------

            case 'check':

                await this.executor.check(
                    page,
                    locator
                );

                break;


            // -------------------------------------
            // UNCHECK
            // -------------------------------------

            case 'uncheck':

                await this.executor.uncheck(
                    page,
                    locator
                );

                break;


            // -------------------------------------
            // SELECT
            // -------------------------------------

            case 'select':

                if (
                    testAction.inputValue === undefined
                ) {

                    throw new Error(
                        'Select action requires inputValue'
                    );
                }


                await this.executor.select(
                    page,
                    locator,
                    testAction.inputValue
                );

                break;


            default:

                throw new Error(
                    `Unsupported action: ${testAction.action}`
                );
        }


    }


    // =========================================
    // Action Validation
    // =========================================

    private async validateAction(
        page: Page,
        locator: string,
        testAction: TestAction
    ): Promise<void> {


        switch (testAction.action) {


            // -------------------------------------
            // CLICK
            // -------------------------------------

            case 'click':

                debugLog(
                    'Validating CLICK'
                );

                break;


            // -------------------------------------
            // FILL
            // -------------------------------------

            case 'fill':

                if (
                    testAction.inputValue === undefined
                ) {

                    throw new Error(
                        'Fill validation requires inputValue'
                    );
                }


                debugLog(
                    `Validating FILL: expected "${testAction.inputValue}"`
                );


                await expect(
                    page.locator(locator)
                ).toHaveValue(
                    testAction.inputValue
                );

                break;


            // -------------------------------------
            // CHECK
            // -------------------------------------

            case 'check':

                debugLog(
                    'Validating CHECK'
                );


                await expect(
                    page.locator(locator)
                ).toBeChecked();

                break;


            // -------------------------------------
            // UNCHECK
            // -------------------------------------

            case 'uncheck':

                debugLog(
                    'Validating UNCHECK'
                );


                await expect(
                    page.locator(locator)
                ).not.toBeChecked();

                break;


            // -------------------------------------
            // SELECT
            // -------------------------------------

            case 'select':

                if (
                    testAction.inputValue === undefined
                ) {

                    throw new Error(
                        'Select validation requires inputValue'
                    );
                }


                debugLog(
                    `Validating SELECT: expected "${testAction.inputValue}"`
                );


                await expect(
                    page.locator(locator)
                ).toHaveValue(
                    testAction.inputValue
                );

                break;


            default:

                throw new Error(
                    `Unsupported validation action: ${testAction.action}`
                );
        }
    }
}
