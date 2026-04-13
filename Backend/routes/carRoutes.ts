import express from 'express';
import { protect, admin } from '../middleware/authMiddleware';
import {
    getCars,
    getCarById,
    createCar,
    updateCar,
    deleteCar,
} from '../controllers/carController';

import { carSchema } from '../schemas/resourceSchemas';
import { validate } from '../middleware/validationMiddleware';

const router = express.Router();

router.route('/')
    .get(getCars)
    .post(protect, admin, validate(carSchema), createCar);

router.route('/:id')
    .get(getCarById)
    .put(protect, admin, validate(carSchema.partial()), updateCar)
    .delete(protect, admin, deleteCar);

export default router;
