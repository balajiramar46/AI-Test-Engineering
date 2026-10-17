import { LocatorStrategy } from '../models/LocatorStrategy';

export const LOCATOR_STRATEGY_PRIORITY: readonly LocatorStrategy[] = [
    'ID',
    'NAME',
    'SUBMIT VALUE',
    'TEXT',
    'PLACEHOLDER',
    'ARIA-LABEL',
    'TITLE',
    'FORM CONTEXT + ID',
    'FORM CONTEXT + NAME'
];