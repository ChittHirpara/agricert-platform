const express = require('express');
const Batch = require('../models/Batch');
const Inspection = require('../models/Inspection');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');

const router = express.Router();

// @route   GET /api/timeline/:productId
// @desc    Get full certification timeline for a product (supply-chain traceability)
router.get('/:productId', async (req, res, next) => {
    try {
        const batch = await Batch.findById(req.params.productId)
            .populate('farmerId', ['name', 'email']);

        if (!batch) return res.status(404).json({ msg: 'Product not found' });

        const timeline = [];

        // 1. Batch Created
        timeline.push({
            event: 'Batch Created',
            actor: batch.farmerId ? batch.farmerId.name : 'Unknown Farmer',
            actorRole: 'Farmer',
            details: { cropName: batch.cropName, quantity: batch.quantity, location: batch.location },
            timestamp: batch.createdAt
        });

        // 2. OCR Inspection & Certification
        const inspection = await Inspection.findOne({ batchId: batch._id })
            .populate('certifierId', ['name', 'email']);

        if (inspection) {
            timeline.push({
                event: 'OCR Inspection',
                actor: inspection.certifierId ? inspection.certifierId.name : 'Unknown Certifier',
                actorRole: 'Certifier',
                details: inspection.ocrData || {},
                timestamp: inspection.timestamp
            });

            timeline.push({
                event: inspection.status === 'approved' ? 'Certification Approved' : 'Certification Rejected',
                actor: inspection.certifierId ? inspection.certifierId.name : 'Unknown Certifier',
                actorRole: 'Certifier',
                timestamp: inspection.timestamp
            });
        }

        // 3. Blockchain Record
        if (batch.blockchainHash) {
            timeline.push({
                event: 'Blockchain Recorded',
                txHash: batch.blockchainHash,
                details: { network: 'Polygon Amoy Testnet' },
                timestamp: inspection ? inspection.timestamp : batch.createdAt
            });
        }

        // 4. Auction
        const auction = await Auction.findOne({ batchId: batch._id })
            .populate('winner', ['name', 'email']);

        if (auction) {
            timeline.push({
                event: 'Auction Started',
                actor: batch.farmerId ? batch.farmerId.name : 'Unknown Farmer',
                actorRole: 'Farmer',
                details: { startingPrice: auction.startingPrice },
                timestamp: auction.createdAt
            });

            if (auction.status === 'completed') {
                timeline.push({
                    event: 'Auction Completed',
                    winner: auction.winner ? auction.winner.name : 'No Winner',
                    details: { highestBid: auction.highestBid },
                    timestamp: auction.createdAt
                });
            }
        }

        res.json({
            productId: batch._id,
            cropName: batch.cropName,
            currentStatus: batch.status,
            timeline
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
