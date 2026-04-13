import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Review from '../models/reviewModel';
import Booking from '../models/bookingModel';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc Create a new review
// @route POST /api/reviews
// @access Private
export const createReview = asyncHandler(async (req: any, res: Response) => {
    const { rating, title, comment, tourId, lodgeId, carId, images } = req.body;
    const userId = req.user._id;

    if (!rating || !title || !comment) {
        res.status(400);
        throw new Error('Please provide rating, title, and comment');
    }

    if (!tourId && !lodgeId && !carId) {
        res.status(400);
        throw new Error('Please provide a resource to review');
    }

    // Optional: Check if user has a confirmed booking for this resource
    const hasBooking = await Booking.findOne({
        user: userId,
        status: 'confirmed',
        $or: [
            { tour: tourId },
            { lodge: lodgeId },
            { car: carId }
        ]
    });

    if (!hasBooking) {
        res.status(403);
        throw new Error('You can only review services you have actually booked and completed');
    }

    const review = await Review.create({
        user: userId,
        rating,
        title,
        comment,
        tour: tourId,
        lodge: lodgeId,
        car: carId,
        images
    });

    res.status(201).json(review);
});

// @desc Get all reviews for a resource
// @route GET /api/reviews
// @access Public
export const getReviews = asyncHandler(async (req: Request, res: Response) => {
    const { tourId, lodgeId, carId } = req.query;

    const query: any = {};
    if (tourId) query.tour = tourId;
    if (lodgeId) query.lodge = lodgeId;
    if (carId) query.car = carId;

    const reviews = await Review.find(query)
        .populate('user', 'firstName lastName avatar')
        .sort('-createdAt');

    res.json(reviews);
});

// @desc Get logged in user reviews
// @route GET /api/reviews/my-reviews
// @access Private
export const getMyReviews = asyncHandler(async (req: any, res: Response) => {
    const reviews = await Review.find({ user: req.user._id })
        .populate('tour', 'title destination images')
        .populate('lodge', 'name location images')
        .populate('car', 'brand model images')
        .sort('-createdAt');

    res.json(reviews);
});

// @desc Delete review
// @route DELETE /api/reviews/:id
// @access Private
export const deleteReview = asyncHandler(async (req: any, res: Response) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('User not authorized');
    }

    await Review.deleteOne({ _id: req.params.id });
    res.json({ message: 'Review removed' });
});
