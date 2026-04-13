import express from 'express';
import { protect, admin } from '../middleware/authMiddleware';
import {
    getLodges,
    getLodgeById,
    createLodge,
    updateLodge,
    deleteLodge,
} from '../controllers/lodgeController';

import { lodgeSchema } from '../schemas/resourceSchemas';
import { validate } from '../middleware/validationMiddleware';

const router = express.Router();

router.route('/')
    .get(getLodges)
    .post(protect, admin, validate(lodgeSchema), createLodge);

router.route('/:id')
    .get(getLodgeById)
    .put(protect, admin, validate(lodgeSchema.partial()), updateLodge)
    .delete(protect, admin, deleteLodge);

export default router;
