import express from 'express';
import { protect, admin } from '../middleware/authMiddleware';
import {
    getTours,
    getTourById,
    createTour,
    updateTour,
    deleteTour,
} from '../controllers/tourController';

import { tourSchema } from '../schemas/resourceSchemas';
import { validate } from '../middleware/validationMiddleware';

const router = express.Router();

router.route('/')
    .get(getTours)
    .post(protect, admin, validate(tourSchema), createTour);

router.route('/:id')
    .get(getTourById)
    .put(protect, admin, validate(tourSchema.partial()), updateTour)
    .delete(protect, admin, deleteTour);

export default router;
