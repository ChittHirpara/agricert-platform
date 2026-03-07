const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { storeOnBlockchain } = require('../services/blockchainService');

const router = express.Router();

// @route   POST /api/blockchain/store
// @desc    Manually store certification hash on blockchain (usually called internally, but exposed for requirements)
router.post('/store', protect, authorize('certifier', 'admin'), async (req, res, next) => {
    try {
        const { productId, certificationData } = req.body;

        if (!productId || !certificationData) {
            return res.status(400).json({ msg: 'productId and certificationData are required' });
        }

        const txHash = await storeOnBlockchain(productId, certificationData);

        res.json({ msg: 'Successfully stored on blockchain', txHash });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
