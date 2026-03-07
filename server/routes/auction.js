const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');

// @route   POST /api/auction/start
// @desc    Farmer sets their certified batch to active auction status
router.post('/start', async (req, res) => {
    try {
        const { batchId } = req.body;

        const batch = await Batch.findById(batchId);
        if (!batch) {
            return res.status(404).json({ msg: 'Batch not found' });
        }

        // Enforce rules: Must be certified before auction
        if (batch.status !== 'Certified' && !batch.blockchainHash) {
            return res.status(400).json({ msg: 'Batch must be certified on blockchain before starting auction.' });
        }

        batch.auctionStatus = 'active';
        await batch.save();

        res.json({ msg: 'Auction started successfully', batch });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/auction/list
// @desc    Distributors fetch all currently active auctions
router.get('/list', async (req, res) => {
    try {
        const activeAuctions = await Batch.find({ auctionStatus: 'active' }).populate('exporter', 'username');
        res.json(activeAuctions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
