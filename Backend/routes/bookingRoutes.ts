import express from 'express';
import { protect, admin } from '../middleware/authMiddleware';
import {
    createBooking,
    getAllBookings,
    updateBooking,
    getUserBookings,
    checkAvailability,
    getBookingById,
    cancelBooking,
} from '../controllers/bookingController';

import { bookingSchema, updateBookingSchema } from '../schemas/bookingSchemas';
import { validate } from '../middleware/validationMiddleware';

const router = express.Router();

router.route('/')
    .post(protect, validate(bookingSchema), createBooking)
    .get(protect, admin, getAllBookings);

router.get('/user', protect, getUserBookings);
router.get('/check-availability', protect, checkAvailability);
router.delete('/:id/cancel', protect, cancelBooking);

router.route('/:id')
    .get(protect, getBookingById)
    .put(protect, admin, updateBooking);

export default router;
