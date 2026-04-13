import express from 'express';
import { protect, admin } from '../middleware/authMiddleware';
import {
    getDashboardStats,
    getAvailability,
    updateAvailability,
    createOfflineBooking,
    getReports,
    getActivityLogs
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

export default router;
