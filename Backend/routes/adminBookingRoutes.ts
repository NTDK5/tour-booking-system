import express from 'express';
import {
    adminListBookings,
    adminGetBooking,
    adminConfirmBooking,
    adminRecordManualPayment,
    adminPatchAllocation,
    adminIssueVoucherStub,
    adminCancelBooking,
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

export default router;
