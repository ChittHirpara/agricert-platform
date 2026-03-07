const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const Inspection = require('../models/Inspection');

/**
 * Public endpoint to verify a product's authenticity
 */
router.get('/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        const batch = await Batch.findById(productId)
            .populate('exporter', 'companyName email phone role')
            .populate('certifier', 'companyName role')
            .populate('auctionWinner', 'companyName role');

        if (!batch) {
            return res.status(404).json({ error: 'Product/Batch not found' });
        }

        const inspection = await Inspection.findOne({ batch: productId })
            .populate('qaAgency', 'companyName');

        res.json({
            success: true,
            data: {
                productDetails: {
                    productType: batch.productType,
                    quantity: batch.quantity,
                    location: batch.location,
                    destination: batch.destination,
                    status: batch.status,
                    createdAt: batch.createdAt
                },
                farmer: batch.exporter,
                certifier: batch.certifier || (inspection ? inspection.qaAgency : null),
                inspectionData: inspection ? {
                    result: inspection.result,
                    date: inspection.inspectionDate,
                    ocrData: inspection.ocrData || null
                } : null,
                blockchain: {
                    hash: batch.blockchainHash || "Not yet certified on blockchain",
                    network: "Polygon Amoy"
                },
                auctionStatus: batch.auctionStatus,
                auctionWinner: batch.auctionWinner || null
            }
        });

    } catch (error) {
        console.error('Verify Route Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
