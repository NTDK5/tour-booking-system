import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // System logs might not have a user
    },
    action: {
        type: String,
        required: true
    },
    resource: {
        type: String,
        required: true
    },
    resourceId: {
        type: String,
        required: false
    },
    details: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['info', 'success', 'warning', 'error'],
        default: 'info'
    },
    ip: String
}, {
    timestamps: true
});

const Log = mongoose.model('Log', logSchema);

export default Log;
