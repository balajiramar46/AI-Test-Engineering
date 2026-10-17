export interface CandidateScore {

    index: number;

    score: number;

    confidence: 'HIGH' | 'MEDIUM' | 'LOW';

    locator: string | null;

    reasons: string[];
}import { LocatorStrategy } from './LocatorStrategy';

export interface CandidateScore {

    index: number;

    score: number;

    confidence: 'HIGH' | 'MEDIUM' | 'LOW';

    locator: string | null;

    reasons: string[];

    strongestStrategy: LocatorStrategy | null;
}