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
    deleteBooking,
    respondToOffer,
    confirmRequestBooking,
    getBookingTimeline,
} from '../controllers/bookingController';

import { bookingSchema, updateBookingSchema } from '../schemas/bookingSchemas';
import { validate } from '../middleware/validationMiddleware';

const router = express.Router();

router.route('/')
    .post(protect, validate(bookingSchema), createBooking)
    .get(protect, admin, getAllBookings);

router.get('/user', protect, getUserBookings);
router.get('/check-availability', protect, checkAvailability);
router.get('/:id/timeline', protect, getBookingTimeline);
router.put('/:id/respond-offer', protect, respondToOffer);
router.put('/:id/confirm-request', protect, admin, confirmRequestBooking);
router.delete('/:id/cancel', protect, cancelBooking);

router.route('/:id')
    .get(protect, getBookingById)
    .put(protect, admin, updateBooking)
    .delete(protect, deleteBooking);

export default router;
