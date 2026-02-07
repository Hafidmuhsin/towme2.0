import ServiceRequest from '../models/ServiceRequest.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

// @desc    Create a new service request
// @route   POST /api/requests
// @access  Private (Customer)
export const createRequest = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        serviceType,
        coordinates, // [longitude, latitude]
        address,
        notes,
        vehicleDetails, // { make, model, licensePlate, color }
    } = req.body;

    try {
        const newRequest = await ServiceRequest.create({
            customer: req.user._id,
            serviceType,
            location: {
                type: 'Point',
                coordinates,
                address,
            },
            notes,
            vehicleDetails: vehicleDetails || {},
            status: 'pending',
        });

        res.status(201).json(newRequest);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error creating request' });
    }
};

// @desc    Get nearby pending requests for Provider
// @route   GET /api/requests/nearby
// @access  Private (Provider)
export const getNearbyRequests = async (req, res) => {
    const { longitude, latitude, radius } = req.query; // radius in km

    if (!longitude || !latitude) {
        return res.status(400).json({ msg: 'Please provide longitude and latitude' });
    }

    const radiKm = radius || 20;

    try {
        const requests = await ServiceRequest.find({
            status: 'pending',
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)],
                    },
                    $maxDistance: radiKm * 1000,
                },
            },
        }).populate('customer', 'name phone rating');

        res.status(200).json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error fetching nearby requests' });
    }
};

// @desc    Accept a request
// @route   PUT /api/requests/:id/accept
// @access  Private (Provider)
export const acceptRequest = async (req, res) => {
    try {
        const request = await ServiceRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ msg: 'Request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ msg: 'Request is no longer available' });
        }

        request.provider = req.user._id;
        request.status = 'accepted';
        request.startTime = new Date();
        await request.save();

        res.status(200).json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error accepting request' });
    }
};

// @desc    Update request status
// @route   PUT /api/requests/:id/status
// @access  Private (Provider)
export const updateRequestStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const request = await ServiceRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ msg: 'Request not found' });
        }

        if (request.provider.toString() !== req.user._id.toString()) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        request.status = status;
        await request.save();

        res.status(200).json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error updating status' });
    }
};

// @desc    Get current user's active/pending requests
// @route   GET /api/requests/my
// @access  Private (Customer/Provider)
export const getMyRequests = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'customer') {
            query = { customer: req.user._id };
        } else if (req.user.role === 'provider') {
            query = { provider: req.user._id };
        } else {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const requests = await ServiceRequest.find(query)
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('provider', 'name phone serviceType location')
            .populate('customer', 'name phone');

        res.status(200).json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error fetching my requests' });
    }
};

// @desc    Cancel a request
// @route   PUT /api/requests/:id/cancel
// @access  Private (Customer/Provider)
export const cancelRequest = async (req, res) => {
    try {
        const request = await ServiceRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ msg: 'Request not found' });
        }

        if (request.customer.toString() !== req.user._id.toString() &&
            (!request.provider || request.provider.toString() !== req.user._id.toString())) {
            return res.status(401).json({ msg: 'Not authorized to cancel this request' });
        }

        if (['completed', 'cancelled', 'paid'].includes(request.status)) {
            return res.status(400).json({ msg: 'Request already finalized' });
        }

        request.status = 'cancelled';
        await request.save();

        res.status(200).json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error cancelling request' });
    }
};

// @desc    Complete a request
// @route   PUT /api/requests/:id/complete
// @access  Private (Provider)
export const completeRequest = async (req, res) => {
    const { finalPrice } = req.body;
    try {
        const request = await ServiceRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ msg: 'Request not found' });
        }

        if (request.provider.toString() !== req.user._id.toString()) {
            return res.status(401).json({ msg: 'Not authorized to complete this request' });
        }

        if (!['accepted', 'in_progress'].includes(request.status)) {
            return res.status(400).json({ msg: 'Request cannot be completed in current status' });
        }

        request.status = 'pending_payment';
        request.endTime = new Date();
        request.finalPrice = finalPrice || 45;
        await request.save();

        res.status(200).json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error completing request' });
    }
};

// @desc    Pay for a request
// @route   PUT /api/requests/:id/pay
// @access  Private (Customer)
export const payRequest = async (req, res) => {
    try {
        const request = await ServiceRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ msg: 'Request not found' });
        }

        if (request.customer.toString() !== req.user._id.toString()) {
            return res.status(401).json({ msg: 'Not authorized to pay for this request' });
        }

        if (request.status !== 'pending_payment') {
            return res.status(400).json({ msg: 'Request is not in payment phase' });
        }

        request.status = 'paid';
        request.paymentId = `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        request.paymentMethod = 'Credit Card';
        await request.save();

        res.status(200).json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error processing payment' });
    }
};
