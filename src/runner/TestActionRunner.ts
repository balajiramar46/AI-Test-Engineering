import { Page, expect } from '@playwright/test';

import { ElementDiscovery } from '../discovery/ElementDiscovery';
import { LocatorIntelligence } from '../locator/LocatorIntelligence';
import { CandidateScoring } from '../locator/CandidateScoring';
import { CandidateSelector } from '../locator/CandidateSelector';
import { ActionExecutor } from '../actions/ActionExecutor';
import { TestAction } from '../models/TestAction';


export class TestActionRunner {

    private discovery: ElementDiscovery;
    private scoringEngine: CandidateScoring;
    private selector: CandidateSelector;
    private locatorEngine: LocatorIntelligence;
    private executor: ActionExecutor;


    constructor() {

        this.discovery = new ElementDiscovery();

        this.scoringEngine = new CandidateScoring();

        this.selector = new CandidateSelector();

        this.locatorEngine = new LocatorIntelligence();

        this.executor = new ActionExecutor();
    }


    async run(
        page: Page,
        testAction: TestAction
    ): Promise<void> {

        console.log(
            '========================================'
        );

        console.log(
            'Executing Test Action:',
            testAction
        );

        console.log(
            '========================================'
        );


        // -----------------------------------------
        // 1. Targeted Discovery
        // -----------------------------------------

        const candidates =
            await this.discovery.findByTarget(
                page,
                testAction.target
            );


        console.log(
            'Matching candidates:',
            candidates.length
        );


        candidates.forEach(
            (element, index) => {

                console.log(
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
                candidates
            );


        console.log(
            'Candidate scores:'
        );


        scores.forEach(result => {

            console.log(
                `Candidate ${result.index}:`,
                result
            );

        });


        // -----------------------------------------
        // 4. Select Best Candidate
        // -----------------------------------------

        const bestCandidate =
            this.selector.selectBest(scores);


        console.log(
            'Best candidate:',
            bestCandidate
        );


        // -----------------------------------------
        // 5. Handle Ambiguity
        // -----------------------------------------

        if (!bestCandidate) {

    console.log(
        '========================================'
    );

    console.log(
        'ACTION BLOCKED'
    );

    console.log(
        '========================================'
    );

    console.log(
        'Reason: Multiple candidates have the same highest score.'
    );

    console.log(
        'Target:',
        testAction.target
    );

    console.log(
        'Candidates:',
        candidates.length
    );

    console.log(
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

        console.log(
            'Best locator:',
            locatorResult.locator
        );

        console.log(
            'Locator strategy:',
            locatorResult.strategy
        );

        console.log(
            'Locator confidence:',
            locatorResult.confidence
        );

        console.log(
            'Locator reason:',
            locatorResult.reason
        );


        // -----------------------------------------
        // 9. Execute Action
        // -----------------------------------------

        switch (testAction.action) {


            // -------------------------------------
            // CLICK
            // -------------------------------------

            case 'click':

                await this.executor.click(
                    page,
                    locatorResult.locator
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
                    locatorResult.locator,
                    testAction.inputValue
                );

                break;


            // -------------------------------------
            // CHECK
            // -------------------------------------

            case 'check':

                await this.executor.check(
                    page,
                    locatorResult.locator
                );

                break;


            // -------------------------------------
            // UNCHECK
            // -------------------------------------

            case 'uncheck':

                await this.executor.uncheck(
                    page,
                    locatorResult.locator
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
                    locatorResult.locator,
                    testAction.inputValue
                );

                break;


            default:

                throw new Error(
                    `Unsupported action: ${testAction.action}`
                );
        }


        console.log(
            'Action completed successfully'
        );


        // -----------------------------------------
        // 10. Validate Action
        // -----------------------------------------

        await this.validateAction(
            page,
            locatorResult.locator,
            testAction
        );


        console.log(
            'Action validation completed successfully'
        );


        console.log(
            '========================================'
        );
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

                console.log(
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


                console.log(
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

                console.log(
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

                console.log(
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


                console.log(
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