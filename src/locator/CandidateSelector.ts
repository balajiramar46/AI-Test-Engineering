import { CandidateScore } from '../models/CandidateScore';
import { StrategyPriority } from '../locator/StrategyPriority';

const debugLog = (...args: unknown[]): void => {
    if (process.env.FRAMEWORK_DEBUG === '1') console.log(...args);
};

export class CandidateSelector {

    selectBest(
        scores: CandidateScore[]
    ): CandidateScore | null {

        if (scores.length === 0) {

            debugLog(
                'Candidate selection: NO CANDIDATES'
            );

            return null;
        }

        // Step 1: Find the highest score
        const highestScore =
            Math.max(
                ...scores.map(
                    candidate => candidate.score
                )
            );

        // Step 2: Keep only candidates
        // having the highest score
        const topCandidates =
            scores.filter(
                candidate =>
                    candidate.score === highestScore
            );

        // Only one candidate has the
        // highest score
        if (topCandidates.length === 1) {

            debugLog(
                'Candidate selection: BEST',
                topCandidates[0].index
            );

            return topCandidates[0];
        }

        // Step 3: Same score.
        // Compare locator strategies.
        debugLog(
            'Candidates have equal scores.'
        );

        debugLog(
            'Comparing locator strategies...'
        );

        const candidatesWithStrategy =
            topCandidates.filter(
                candidate =>
                    candidate.strongestStrategy !== null
            );

        // If only one candidate has
        // a locator strategy, select it.
        if (
            candidatesWithStrategy.length === 1
        ) {

            debugLog(
                'Candidate selection: BEST by strategy',
                candidatesWithStrategy[0].index
            );

            return candidatesWithStrategy[0];
        }

        // If multiple candidates have strategies,
        // compare their priority.
        if (
            candidatesWithStrategy.length > 1
        ) {

            const sorted =
                [...candidatesWithStrategy].sort(
                    (a, b) => {

                        const priorityA =
                            StrategyPriority.getPriority(
                                a.strongestStrategy!
                            );

                        const priorityB =
                            StrategyPriority.getPriority(
                                b.strongestStrategy!
                            );

                        return priorityA - priorityB;
                    }
                );

            const best =
                sorted[0];

            const second =
                sorted[1];

            // If strategy priority also differs,
            // select the stronger strategy.
            if (
                StrategyPriority.getPriority(
                    best.strongestStrategy!
                )
                <
                StrategyPriority.getPriority(
                    second.strongestStrategy!
                )
            ) {

                debugLog(
                    'Candidate selection: BEST by strategy priority',
                    best.index
                );

                return best;
            }
        }

        // Still ambiguous
        debugLog(
            'Candidate selection: AMBIGUOUS'
        );

        debugLog(
            'Ambiguous candidates:',
            topCandidates
        );

        return null;
    }
}