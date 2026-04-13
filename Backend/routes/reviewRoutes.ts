import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
    createReview,
    getReviews,
    getMyReviews,
    deleteReview
} from '../controllers/reviewController';

const router = express.Router();

router.route('/')
    .get(getReviews)
    .post(protect, createReview);

router.get('/my-reviews', protect, getMyReviews);

router.route('/:id')
    .delete(protect, deleteReview);

export default router;
