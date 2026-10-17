import { LocatorStrategy } from '../models/LocatorStrategy';
import { LOCATOR_STRATEGY_PRIORITY } from './LocatorStrategyConfig';

export class StrategyPriority {

    static getPriority(
        strategy: LocatorStrategy
    ): number {

        return LOCATOR_STRATEGY_PRIORITY.indexOf(
            strategy
        );
    }

    static isStronger(
        strategyA: LocatorStrategy,
        strategyB: LocatorStrategy
    ): boolean {

        return this.getPriority(strategyA)
            < this.getPriority(strategyB);
    }
}