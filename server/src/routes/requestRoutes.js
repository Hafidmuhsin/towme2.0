import express from 'express';
import { check } from 'express-validator';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { createRequest, getNearbyRequests, acceptRequest, getMyRequests, cancelRequest, completeRequest, payRequest, updateRequestStatus } from '../controllers/requestController.js';

const router = express.Router();

router.post(
    '/',
    protect,
    authorize('customer'),
    [
        check('serviceType', 'Service Type is required').not().isEmpty(),
        check('coordinates', 'Location coordinates are required').isArray(),
        check('coordinates.*', 'Enter valid longitude/latitude').isFloat(),
    ],
    createRequest
);

router.get('/my', protect, getMyRequests);

router.get(
    '/nearby',
    protect,
    authorize('provider'),
    getNearbyRequests
);

router.put(
    '/:id/accept',
    protect,
    authorize('provider'),
    acceptRequest
);

router.put(
    '/:id/status',
    protect,
    authorize('provider'),
    updateRequestStatus
);

router.put(
    '/:id/cancel',
    protect,
    cancelRequest
);

router.put(
    '/:id/complete',
    protect,
    authorize('provider'),
    completeRequest
);

router.put(
    '/:id/pay',
    protect,
    authorize('customer'),
    payRequest
);

export default router;
