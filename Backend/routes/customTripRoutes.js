const express = require('express');
const { protect, admin } = require("../middleware/authMiddleware.js");

const {
    createCustomTrip,
    getMyCustomTrips,
    getCustomTripById,
    setProposal,
    updateStatus,
    deleteCustomTrip,
    getAllCustomTrips
} = require('../controllers/customTripController.js');

const router = express.Router();

// User routes
router.post('/', protect, createCustomTrip);
router.get('/my-requests', protect, getMyCustomTrips);
router.get('/:id', protect, getCustomTripById);

// Admin routes
router.put('/:id/proposal', protect, admin, setProposal);
router.put('/:id/status', protect, admin, updateStatus);
router.delete('/:id', protect, admin, deleteCustomTrip);
router.get('/', protect, admin, getAllCustomTrips);

module.exports = router; 