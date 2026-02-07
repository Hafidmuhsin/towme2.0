import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    serviceType: {
        type: String,
        enum: ['tow', 'mechanic', 'tire', 'fuel', 'lockout', 'battery', 'other'],
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'in_progress', 'completed', 'pending_payment', 'paid', 'cancelled'],
        default: 'pending',
    },
    paymentId: String,
    paymentMethod: String,
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
        },
        address: String,
    },
    notes: String,
    photos: [String], // URLs from Cloudinary
    vehicleDetails: {
        // If user has multiple vehicles, copy details for this request
        make: String,
        model: String,
        licensePlate: String,
        color: String,
    },
    estimatedPrice: Number,
    finalPrice: Number,
    startTime: Date,
    endTime: Date,
    rating: Number, // Customer rating for provider
    review: String,
}, {
    timestamps: true,
});

// IMPORTANT: Create 2dsphere index for location-based queries
serviceRequestSchema.index({ location: '2dsphere' });

export default mongoose.model('ServiceRequest', serviceRequestSchema);
