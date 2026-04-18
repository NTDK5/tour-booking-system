import express from 'express';
import { protect, admin } from '../middleware/authMiddleware';
import adminPackageRoutes from './adminPackageRoutes';
import adminBookingRoutes from './adminBookingRoutes';
import {
    getDashboardStats,
    getAvailability,
    updateAvailability,
    createOfflineBooking,
    getReports,
    getActivityLogs,
    getResources,
    syncResources,
    getUnifiedCalendarBookings,
    checkUnifiedResourceAvailability,
} from '../controllers/adminController';

const router = express.Router();

// All routes here are protected and require admin role
router.use(protect);
router.use(admin);

router.get('/stats', getDashboardStats);
router.get('/availability', getAvailability);
router.post('/availability', updateAvailability);
router.post('/bookings/offline', createOfflineBooking);
router.get('/reports', getReports);
router.get('/logs', getActivityLogs);
router.get('/resources', getResources);
router.post('/resources/sync', syncResources);
router.get('/calendar/bookings', getUnifiedCalendarBookings);
router.post('/calendar/check-availability', checkUnifiedResourceAvailability);

/** Tour / package builder API — GET/POST/PATCH `/api/admin/packages`, etc. */
router.use('/packages', adminPackageRoutes);

router.use('/bookings', adminBookingRoutes);

export default router;
