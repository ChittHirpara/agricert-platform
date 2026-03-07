const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const Inspection = require('../models/Inspection');

const router = express.Router();

// @route   GET /api/inspections
// @desc    Get all inspections (certifier access)
router.get('/', protect, authorize('certifier', 'admin'), async (req, res, next) => {
  try {
    const inspections = await Inspection.find()
      .populate('batchId', ['cropName', 'quantity', 'location'])
      .populate('certifierId', ['name', 'email'])
      .sort({ timestamp: -1 });
    res.json(inspections);
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/inspections/:batchId
// @desc    Get inspections for a specific batch
router.get('/:batchId', protect, async (req, res, next) => {
  try {
    const inspections = await Inspection.find({ batchId: req.params.batchId })
      .populate('certifierId', ['name', 'email']);
    res.json(inspections);
  } catch (err) {
    next(err);
  }
});

module.exports = router;