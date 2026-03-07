const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const Batch = require('../models/Batch');
const Inspection = require('../models/Inspection');
const { storeOnBlockchain } = require('../services/blockchainService');

const router = express.Router();

// @route   POST /api/certifications/approve
router.post('/approve', protect, authorize('certifier'), async (req, res, next) => {
    try {
        const { batchId, ocrData } = req.body;

        const batch = await Batch.findById(batchId);
        if (!batch) return res.status(404).json({ msg: 'Batch not found' });
        if (batch.status !== 'pending') return res.status(400).json({ msg: 'Batch is already processed' });

        // Store OCR data in inspection records
        const inspection = new Inspection({
            batchId,
            certifierId: req.user.id,
            ocrData,
            status: 'approved'
        });
        await inspection.save();

        // Trigger blockchain certification
        const certificationData = {
            batchId,
            certifierId: req.user.id,
            ocrData,
            timestamp: new Date().toISOString()
        };

        // Store on blockchain
        const txHash = await storeOnBlockchain(batchId, certificationData);

        // Update batch status
        batch.status = 'certified';
        batch.blockchainHash = txHash;
        await batch.save();

        res.json({ msg: 'Batch certified successfully', batch, inspection });
    } catch (err) {
        next(err);
    }
});

// @route   POST /api/certifications/reject
router.post('/reject', protect, authorize('certifier'), async (req, res, next) => {
    try {
        const { batchId, reason } = req.body; // Reason can be stored if needed (not in strict schema but good to have)

        const batch = await Batch.findById(batchId);
        if (!batch) return res.status(404).json({ msg: 'Batch not found' });

        const inspection = new Inspection({
            batchId,
            certifierId: req.user.id,
            status: 'rejected'
        });
        await inspection.save();

        batch.status = 'rejected';
        await batch.save();

        res.json({ msg: 'Batch rejected', batch });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
