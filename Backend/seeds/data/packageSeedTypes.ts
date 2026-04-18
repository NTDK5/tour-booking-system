import type { Types } from 'mongoose';

/** Plain object inserted via Tour.create — matches enterprise tour package schema + legacy compat fields */
export type PackageSeedDoc = Record<string, unknown>;

export interface SeedContext {
    tourIdsBySlug: Map<string, Types.ObjectId>;
    departureIdsBySku: Map<string, Types.ObjectId>;
}
