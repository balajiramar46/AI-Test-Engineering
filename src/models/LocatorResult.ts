import { LocatorStrategy } from './LocatorStrategy';

export interface LocatorResult {

    locator: string;

    strategy: LocatorStrategy;

    confidence: 'HIGH' | 'MEDIUM' | 'LOW';

    reason: string;
}