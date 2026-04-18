import { northHistoricalPackage } from './northHistorical';
import { simienTrekPackage } from './simienTrek';
import { omoCulturalPackage } from './omoCultural';
import { baleWildlifePackage } from './baleWildlife';
import { luxuryHighlightsPackage } from './luxuryHighlights';
import { danakilAdventurePackage } from './danakilAdventure';

/** Six flagship Ethiopian tour packages — production-grade narrative & pricing diversity */
export const PREMIUM_PACKAGES = [
    northHistoricalPackage,
    simienTrekPackage,
    omoCulturalPackage,
    baleWildlifePackage,
    luxuryHighlightsPackage,
    danakilAdventurePackage,
];

export type PremiumPackageSeed = (typeof PREMIUM_PACKAGES)[number];
