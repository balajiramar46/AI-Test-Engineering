import { Page } from '@playwright/test';
import { ElementDiscovery } from '../discovery/ElementDiscovery';
import { ElementTarget } from '../models/ElementTarget';
import { CandidateScoring } from './CandidateScoring';
import { CandidateSelector } from './CandidateSelector';
import { LocatorIntelligence } from './LocatorIntelligence';

/** Re-discovers a target after a locator failure and returns a different, unique locator. */
export class SelfHealingLocator {
    private readonly discovery = new ElementDiscovery();
    private readonly scoring = new CandidateScoring();
    private readonly selector = new CandidateSelector();
    private readonly locatorIntelligence = new LocatorIntelligence();

    async findReplacement(
        page: Page,
        target: ElementTarget,
        failedLocator: string
    ): Promise<string | null> {
        const candidates = await this.discovery.findByTarget(page, target);
        if (candidates.length === 0) return null;

        const scores = await this.scoring.scoreCandidates(page, candidates, target.intent);
        const best = this.selector.selectBest(scores);
        if (!best) return null;

        const result = await this.locatorIntelligence.findBestLocator(page, candidates[best.index]);
        if (!result || result.locator === failedLocator) return null;

        return result.locator;
    }
}
