const asyncHandler = require('express-async-handler');
const CustomTripRequest = require('../models/customTripModel.js');

// @desc    Create custom trip request
// @route   POST /api/custom-trips
// @access  Private
const createCustomTrip = asyncHandler(async (req, res) => {
    const {
        destinations,
        startDate,
        endDate,
        groupSize,
        accommodation,
        transport,
        activities,
        budgetRange,
        specialRequests
    } = req.body;

    const customTrip = await CustomTripRequest.create({
        user: req.user._id,
        destinations,
        startDate,
        endDate,
        groupSize,
        accommodation,
        transport,
        activities,
        budgetRange,
        specialRequests
    });

    res.status(201).json(customTrip);
});

// @desc    Get current user's custom trip requests
// @route   GET /api/custom-trips/my-requests
// @access  Private
const getMyCustomTrips = asyncHandler(async (req, res) => {
    const trips = await CustomTripRequest.find({ user: req.user._id })
        .sort({ createdAt: -1 });
    res.json(trips);
});

// @desc    Get a specific custom trip request by id
// @route   GET /api/custom-trips/:id
// @access  Private (owner) or Admin
const getCustomTripById = asyncHandler(async (req, res) => {
    const trip = await CustomTripRequest.findById(req.params.id)
        .populate('user', 'first_name last_name email');
    if (!trip) {
        res.status(404);
        throw new Error('Custom trip request not found');
    }
    if (String(trip.user._id) !== String(req.user._id) && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to view this request');
    }
    res.json(trip);
});

// @desc    Admin: attach proposal and set status to Offer Sent
// @route   PUT /api/custom-trips/:id/proposal
// @access  Private/Admin
const setProposal = asyncHandler(async (req, res) => {
    const { itinerary, price, pdfUrl } = req.body;
    const trip = await CustomTripRequest.findById(req.params.id);
    if (!trip) {
        res.status(404);
        throw new Error('Custom trip request not found');
    }
    trip.proposal = { itinerary, price, pdfUrl };
    trip.status = 'Offer Sent';
    await trip.save();
    res.json(trip);
});

// @desc    Admin: update status (Reviewed, Booked, Cancelled)
// @route   PUT /api/custom-trips/:id/status
// @access  Private/Admin
const updateStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const allowed = ['Reviewed', 'Offer Sent', 'Booked', 'Cancelled', 'Pending'];
    if (!allowed.includes(status)) {
        res.status(400);
        throw new Error('Invalid status');
    }
    const trip = await CustomTripRequest.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
    );
    if (!trip) {
        res.status(404);
        throw new Error('Custom trip request not found');
    }
    res.json(trip);
});

// @desc    Admin: delete a custom trip request
// @route   DELETE /api/custom-trips/:id
// @access  Private/Admin
const deleteCustomTrip = asyncHandler(async (req, res) => {
    const trip = await CustomTripRequest.findById(req.params.id);
    if (!trip) {
        res.status(404);
        throw new Error('Custom trip request not found');
    }
    await trip.deleteOne();
    res.json({ message: 'Custom trip request deleted' });
});

// @desc    Admin: list all custom trip requests
// @route   GET /api/custom-trips
// @access  Private/Admin
const getAllCustomTrips = asyncHandler(async (req, res) => {
    const trips = await CustomTripRequest.find({})
        .populate('user', 'first_name last_name email')
        .sort({ createdAt: -1 });
    res.json(trips);
});

module.exports = {
    createCustomTrip,
    getMyCustomTrips,
    getCustomTripById,
    setProposal,
    updateStatus,
    deleteCustomTrip,
    getAllCustomTrips
}; 