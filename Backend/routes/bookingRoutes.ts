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
    payBookingBalance,
    quoteBooking,
    getTourBookingOptions,
} from '../controllers/bookingController';

import { bookingSchema, updateBookingSchema, payBalanceSchema } from '../schemas/bookingSchemas';
import { validate } from '../middleware/validationMiddleware';

const router = express.Router();

router.route('/')
    .post(protect, validate(bookingSchema), createBooking)
    .get(protect, admin, getAllBookings);

router.get('/user', protect, getUserBookings);
router.get('/check-availability', protect, checkAvailability);
router.post('/quote', protect, quoteBooking);
router.get('/options/tour/:tourId', protect, getTourBookingOptions);
router.get('/:id/timeline', protect, getBookingTimeline);
router.post('/:id/payments/balance', protect, validate(payBalanceSchema), payBookingBalance);
router.put('/:id/respond-offer', protect, respondToOffer);
router.put('/:id/confirm-request', protect, admin, confirmRequestBooking);
router.delete('/:id/cancel', protect, cancelBooking);

router.route('/:id')
    .get(protect, getBookingById)
    .put(protect, admin, updateBooking)
    .delete(protect, deleteBooking);

export default router;
