import express from 'express';
import { protect, admin } from '../middleware/authMiddleware';
import {
    getActivities,
    getActivityById,
    createActivity,
    updateActivity,
    deleteActivity
} from '../controllers/activityController';

const router = express.Router();

router.route('/')
    .get(getActivities)
    .post(protect, admin, createActivity);

router.route('/:id')
    .get(getActivityById)
    .put(protect, admin, updateActivity)
    .delete(protect, admin, deleteActivity);

export default router;
