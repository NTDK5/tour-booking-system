import express from 'express';
import {
    getPackages,
    getPackageById,
    postPackageQuote,
    getPackageAvailability,
} from '../modules/packages/controllers/publicPackageController';

const router = express.Router();

router.get('/', getPackages);
router.post('/:id/quote', postPackageQuote);
router.get('/:id/availability', getPackageAvailability);
router.get('/:id', getPackageById);

export default router;
