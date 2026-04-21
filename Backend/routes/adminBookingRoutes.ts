import express from 'express';
import {
    adminListBookings,
    adminGetBooking,
    adminConfirmBooking,
    adminRecordManualPayment,
    adminPatchAllocation,
    adminIssueVoucherStub,
    adminCancelBooking,
    adminUpdateBookingStatus,
} from '../controllers/adminBookingController';
import { validate } from '../middleware/validationMiddleware';
import { manualPaymentSchema } from '../schemas/bookingSchemas';

const router = express.Router();

router.get('/', adminListBookings);
router.get('/:id', adminGetBooking);
router.post('/:id/confirm', adminConfirmBooking);
router.post('/:id/record-payment', validate(manualPaymentSchema), adminRecordManualPayment);
router.patch('/:id/allocations', adminPatchAllocation);
router.post('/:id/issue-voucher', adminIssueVoucherStub);
router.post('/:id/cancel', adminCancelBooking);
router.patch('/:id/status', adminUpdateBookingStatus);

export default router;
