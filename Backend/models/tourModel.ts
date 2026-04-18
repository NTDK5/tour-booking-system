/**
 * Tour / TourPackage — persisted in Mongo collection `tours`.
 * Full schema lives in modules/packages/models/tourPackageSchema.ts
 */
import { createTourPackageModel } from '../modules/packages/models/tourPackageSchema';

const Tour = createTourPackageModel();
export default Tour;
