/**
 * Legacy ↔ TourPackage field mapping (reference for migration & API compat).
 *
 * Legacy flat Tour document:
 * - title, description, destination (string), price, duration (string), imageUrl[], itinerary[{day, activities}], category, difficulty
 *
 * Enterprise TourPackage document adds:
 * - packageCode, slug, shortDescription, fullDescription, tourType, status, schemaVersion
 * - duration: { days, nights }, destinations[], startLocation, endLocation
 * - Rich itinerary, pricing engine, availability rules, accommodations, transport, addons, SEO, etc.
 *
 * Backward-compat fields kept on same document:
 * - legacyPrice, legacyDestination — populated from old rows until fully migrated
 * - price — mirror of basePrice or legacyPrice for admin/booking fallbacks
 */

export const LEGACY_DEFAULT_SCHEMA_VERSION = 1;
export const ENTERPRISE_SCHEMA_VERSION = 2;
