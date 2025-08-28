const mongoose = require('mongoose');

const groupSizeSchema = new mongoose.Schema({
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 }
}, { _id: false });

const budgetRangeSchema = new mongoose.Schema({
    min: { type: Number },
    max: { type: Number }
}, { _id: false });

const proposalSchema = new mongoose.Schema({
    itinerary: { type: String },
    price: { type: Number },
    pdfUrl: { type: String }
}, { _id: false });

const customTripRequestSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    destinations: [{ type: String }],
    startDate: { type: Date },
    endDate: { type: Date },
    groupSize: { type: groupSizeSchema, default: () => ({}) },
    accommodation: { type: String, enum: ['budget', 'mid-range', 'luxury'], default: 'budget' },
    transport: { type: String, enum: ['car', 'flight', 'bus'], default: 'car' },
    activities: [{ type: String }],
    budgetRange: { type: budgetRangeSchema, default: () => ({}) },
    specialRequests: { type: String },
    status: { type: String, enum: ['Pending', 'Reviewed', 'Offer Sent', 'Booked', 'Cancelled'], default: 'Pending' },
    proposal: { type: proposalSchema, default: () => ({}) }
}, {
    timestamps: true
});

const CustomTripRequest = mongoose.model('CustomTripRequest', customTripRequestSchema);

module.exports = CustomTripRequest; 