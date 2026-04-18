import express from 'express';
import { validate } from '../middleware/validationMiddleware';
import {
    getAdminPackages,
    getAdminPackageById,
    createAdminPackage,
    updateAdminPackage,
    deleteAdminPackage,
    patchAdminPackageSection,
} from '../modules/packages/controllers/adminPackageController';
import { tourPackageCreateSchema } from '../modules/packages/validators/packageSchemas';

/**
 * Mounted at `/packages` under `adminRoutes` (full path `/api/admin/packages`).
 * Auth: `protect` + `admin` applied by parent admin router.
 */
const router = express.Router();

router.route('/').get(getAdminPackages).post(validate(tourPackageCreateSchema), createAdminPackage);

router.route('/:id').get(getAdminPackageById).put(validate(tourPackageCreateSchema.partial()), updateAdminPackage).delete(deleteAdminPackage);

router.patch('/:id/:section', patchAdminPackageSection);

export default router;
