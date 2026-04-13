import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import CustomTripOption from '../models/customTripOptionModel';
import CustomTrip from '../models/customTripModel';
import Booking from '../models/bookingModel';
import Destination from '../models/destinationModel';
import Itinerary from '../models/itineraryModel';
import { BookingStatus } from './bookingController';
import Log from '../models/logModel';

// @desc Get all custom trip options
// @route GET /api/custom-trips/options
// @access Public
export const getCustomTripOptions = asyncHandler(async (req: Request, res: Response) => {
    const options = await CustomTripOption.find({ available: true });
    res.json(options);
});

// @desc Get active destinations for custom builder
// @route GET /api/custom-trips/destinations
// @access Public
export const getBuilderDestinations = asyncHandler(async (_req: Request, res: Response) => {
    const destinations = await Destination.find({ isActive: true }).sort({ name: 1 });
    res.json(destinations);
});

// @desc Get itineraries by destination
// @route GET /api/custom-trips/itineraries
// @access Public
export const getItinerariesByDestination = asyncHandler(async (req: Request, res: Response) => {
    const { destinationId } = req.query;

    if (!destinationId) {
        res.status(400);
        throw new Error('destinationId is required');
    }

    const itineraries = await Itinerary.find({
        destination: destinationId,
        isActive: true
    })
        .populate('activities', 'title category duration')
        .sort({ isPopular: -1, price: 1 });

    res.json(itineraries);
});

// @desc Create a custom trip option
// @route POST /api/custom-trips/options
// @access Private/Admin
export const createCustomTripOption = asyncHandler(async (req: Request, res: Response) => {
    const { name, type, description, basePrice, imageUrl } = req.body;
    const option = await CustomTripOption.create({
        name,
        type,
        description,
        basePrice,
        imageUrl
    });
    res.status(201).json(option);
});

// @desc Update a custom trip option
// @route PUT /api/custom-trips/options/:id
// @access Private/Admin
export const updateCustomTripOption = asyncHandler(async (req: Request, res: Response) => {
    const option = await CustomTripOption.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!option) {
        res.status(404);
        throw new Error('Option not found');
    }
    res.json(option);
});

// @desc Delete a custom trip option
// @route DELETE /api/custom-trips/options/:id
// @access Private/Admin
export const deleteCustomTripOption = asyncHandler(async (req: Request, res: Response) => {
    const option = await CustomTripOption.findById(req.params.id);
    if (!option) {
        res.status(404);
        throw new Error('Option not found');
    }
    await option.deleteOne();
    res.json({ message: 'Option removed' });
});

// @desc Submit a custom trip request
// @route POST /api/custom-trips/request
// @access Private
export const submitCustomTripRequest = asyncHandler(async (req: any, res: Response) => {
    const { days, itinerary, notes, estimatedBudget, mode, templateName, pricingBreakdown, finalPrice } = req.body;
    const normalizedItinerary = (itinerary || []).map((item: any, idx: number) => ({
        day: item.day || idx + 1,
        destination: item.destination || item.destinationId || undefined,
        itineraryItem: item.itineraryItem || item.itineraryItemId || undefined,
        options: item.options || [],
        notes: item.notes || ''
    }));

    // Create the custom trip itinerary first
    const customTrip = await CustomTrip.create({
        user: req.user._id,
        days,
        itinerary: normalizedItinerary,
        notes,
        estimatedBudget,
        mode,
        templateName,
        pricingBreakdown,
        finalPrice
    });

    // Create a corresponding booking that tracks the status
    const booking = await Booking.create({
        user: req.user._id,
        bookingType: 'Tour', // Custom trips are treated as Tours
        customTrip: customTrip._id,
        numberOfPeople: 1, // Default, can be updated during pricing
        totalPrice: 0, // Admin will propose this
        status: BookingStatus.SUBMITTED,
        isRequest: true,
        paymentMethod: 'cash', // Placeholder
        notes: `Custom Trip Request: ${notes || 'See itinerary'}`,
        history: [{
            status: BookingStatus.SUBMITTED,
            timestamp: new Date(),
            comment: 'Custom trip request submitted'
        }]
    });

    // Log action
    await Log.create({
        user: req.user._id,
        action: 'Submitted custom trip request',
        resource: 'CustomTrip',
        resourceId: customTrip._id,
        details: `${days} days request submitted`,
        status: 'success'
    });

    res.status(201).json({ customTrip, booking });
});

// @desc Get all custom trip requests (Admin)
// @route GET /api/custom-trips/requests
// @access Private/Admin
export const getAllCustomTripRequests = asyncHandler(async (req: Request, res: Response) => {
    const bookings = await Booking.find({ customTrip: { $exists: true } })
        .populate('user', 'first_name last_name email')
        .populate({
            path: 'customTrip',
            populate: [
                { path: 'itinerary.options', model: 'CustomTripOption' },
                { path: 'itinerary.destination', model: 'Destination' },
                { path: 'itinerary.itineraryItem', model: 'Itinerary' }
            ]
        })
        .sort({ createdAt: -1 });

    const requests = bookings
        .filter((booking: any) => booking.customTrip)
        .map((booking: any) => {
            const trip = booking.customTrip;
            return {
                _id: trip._id,
                user: booking.user,
                days: trip.days,
                itinerary: trip.itinerary,
                notes: trip.notes,
                estimatedBudget: trip.estimatedBudget,
                mode: trip.mode,
                templateName: trip.templateName,
                pricingBreakdown: trip.pricingBreakdown,
                finalPrice: trip.finalPrice,
                createdAt: trip.createdAt,
                updatedAt: trip.updatedAt,
                booking: {
                    _id: booking._id,
                    status: booking.status,
                    proposedPrice: booking.proposedPrice,
                    totalPrice: booking.totalPrice
                }
            };
        });

    res.json(requests);
});
