const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const Auction = require('../models/Auction');
const Batch = require('../models/Batch');
const Bid = require('../models/Bid');

const router = express.Router();

// @route   POST /api/auction/start
// @desc    Start an auction for a certified batch
router.post('/start', protect, authorize('farmer'), async (req, res, next) => {
    try {
        const { batchId, startingPrice } = req.body;

        const batch = await Batch.findById(batchId);
        if (!batch) return res.status(404).json({ msg: 'Batch not found' });
        if (batch.farmerId.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized - you do not own this batch' });
        }
        if (batch.status !== 'certified') {
            return res.status(400).json({ msg: 'Only certified batches can be auctioned' });
        }
        if (batch.auctionStatus !== 'pending') {
            return res.status(400).json({ msg: 'Auction already started or completed for this batch' });
        }

        const auction = new Auction({
            batchId,
            farmerId: req.user.id,
            startingPrice: startingPrice || 0,
            highestBid: 0,
            status: 'active'
        });
        await auction.save();

        batch.auctionStatus = 'active';
        await batch.save();

        res.status(201).json({ msg: 'Auction started', auction });
    } catch (err) {
        next(err);
    }
});

// @route   GET /api/auction/list
// @desc    List all active auctions
router.get('/list', protect, async (req, res, next) => {
    try {
        const auctions = await Auction.find({ status: 'active' })
            .populate('batchId', ['cropName', 'quantity', 'location'])
            .populate('farmerId', ['name', 'email'])
            .sort({ createdAt: -1 });
        res.json(auctions);
    } catch (err) {
        next(err);
    }
});

// @route   POST /api/auction/bid
// @desc    Place a bid on an auction (REST fallback, real-time via Socket.IO)
router.post('/bid', protect, authorize('distributor', 'consumer'), async (req, res, next) => {
    try {
        const { auctionId, amount } = req.body;

        const auction = await Auction.findById(auctionId);
        if (!auction) return res.status(404).json({ msg: 'Auction not found' });
        if (auction.status !== 'active') return res.status(400).json({ msg: 'Auction is not active' });
        if (amount <= auction.highestBid && amount <= auction.startingPrice) {
            return res.status(400).json({ msg: `Bid must be higher than current highest bid (${auction.highestBid || auction.startingPrice})` });
        }

        const bid = new Bid({
            auctionId,
            bidderId: req.user.id,
            amount
        });
        await bid.save();

        auction.highestBid = amount;
        auction.winner = req.user.id;
        await auction.save();

        res.json({ msg: 'Bid placed successfully', auction });
    } catch (err) {
        next(err);
    }
});

// @route   POST /api/auction/end
// @desc    End an auction (farmer only)
router.post('/end', protect, authorize('farmer'), async (req, res, next) => {
    try {
        const { auctionId } = req.body;
        const auction = await Auction.findById(auctionId);
        if (!auction) return res.status(404).json({ msg: 'Auction not found' });
        if (auction.farmerId.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        auction.status = 'completed';
        await auction.save();

        const batch = await Batch.findById(auction.batchId);
        if (batch) {
            batch.auctionStatus = 'completed';
            if (auction.winner) batch.auctionWinner = auction.winner;
            await batch.save();
        }

        res.json({ msg: 'Auction ended', auction });
    } catch (err) {
        next(err);
    }
});

// @route   GET /api/auction/:batchId/leaderboard
// @desc    Get top bidders for an auction (transparency + fair bidding)
router.get('/:batchId/leaderboard', protect, async (req, res, next) => {
    try {
        const auction = await Auction.findOne({ batchId: req.params.batchId });
        if (!auction) return res.status(404).json({ msg: 'Auction not found for this batch' });

        const topBids = await Bid.find({ auctionId: auction._id })
            .populate('bidderId', ['name', 'email'])
            .sort({ amount: -1 })
            .limit(10);

        res.json({
            batchId: req.params.batchId,
            auctionId: auction._id,
            status: auction.status,
            startingPrice: auction.startingPrice,
            highestBid: auction.highestBid,
            topBids: topBids.map((bid, index) => ({
                rank: index + 1,
                bidder: bid.bidderId ? bid.bidderId.name : 'Anonymous',
                amount: bid.amount,
                timestamp: bid.timestamp
            }))
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
