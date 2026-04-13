import express, { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { protect, admin } from '../middleware/authMiddleware';
import {
    getCustomTripOptions,
    getBuilderDestinations,
    getItinerariesByDestination,
    createCustomTripOption,
    updateCustomTripOption,
    deleteCustomTripOption,
    submitCustomTripRequest,
    getAllCustomTripRequests
} from '../controllers/customTripController';

const router = express.Router();

// Options management
router.route('/options')
    .get(getCustomTripOptions)
    .post(protect, admin, createCustomTripOption);

router.get('/destinations', getBuilderDestinations);
router.get('/itineraries', getItinerariesByDestination);

router.route('/options/:id')
    .put(protect, admin, updateCustomTripOption)
    .delete(protect, admin, deleteCustomTripOption);

// Request submission/retrieval
router.post('/request', protect, submitCustomTripRequest);
router.get('/requests', protect, admin, getAllCustomTripRequests);

export default router;
