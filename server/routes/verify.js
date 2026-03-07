const express = require('express');
const Batch = require('../models/Batch');
const Inspection = require('../models/Inspection');
const Auction = require('../models/Auction');

const router = express.Router();

// @route   GET /api/verify/:productId
// @desc    Consumer verification - get full traceability data for a product
router.get('/:productId', async (req, res, next) => {
    try {
        const batch = await Batch.findById(req.params.productId)
            .populate('farmerId', ['name', 'email']);

        if (!batch) return res.status(404).json({ msg: 'Product not found' });

        // Get inspection/certification data
        const inspection = await Inspection.findOne({ batchId: batch._id })
            .populate('certifierId', ['name', 'email']);

        // Get auction data
        const auction = await Auction.findOne({ batchId: batch._id })
            .populate('winner', ['name', 'email']);

        res.json({
            product: {
                id: batch._id,
                cropName: batch.cropName,
                quantity: batch.quantity,
                location: batch.location,
                status: batch.status,
                createdAt: batch.createdAt
            },
            farmer: batch.farmerId ? {
                name: batch.farmerId.name,
                email: batch.farmerId.email
            } : null,
            certification: inspection ? {
                certifier: inspection.certifierId ? {
                    name: inspection.certifierId.name,
                    email: inspection.certifierId.email
                } : null,
                ocrData: inspection.ocrData,
                status: inspection.status,
                timestamp: inspection.timestamp
            } : null,
            blockchain: {
                txHash: batch.blockchainHash
            },
            auction: auction ? {
                status: auction.status,
                highestBid: auction.highestBid,
                winner: auction.winner ? {
                    name: auction.winner.name,
                    email: auction.winner.email
                } : null
            } : null
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
