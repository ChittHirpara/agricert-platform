const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const Inspection = require('../models/Inspection');

// @route   GET /api/inspections/pending
// @desc    Get all batches waiting for inspection (Status = Submitted)
router.get('/pending', async (req, res) => {
  try {
    const batches = await Batch.find({ status: 'Submitted' }).populate('exporter', 'username');
    res.json(batches);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/inspections
// @desc    Submit inspection results & Update Batch Status
router.post('/', async (req, res) => {
  try {
    const { batchId, qaId, moisture, pesticide, organicStatus, isoCode, result } = req.body;

    // 1. Save the Scientific Data
    const newInspection = new Inspection({
      batch: batchId,
      qaAgency: qaId,
      moisture,
      pesticide,
      organicStatus,
      isoCode,
      result
    });
    await newInspection.save();

    // 2. Update the Batch Status to "Certified" or "Rejected"
    const status = result === 'Pass' ? 'Certified' : 'Rejected';
    await Batch.findByIdAndUpdate(batchId, { status: status });

    res.json({ msg: 'Inspection Submitted', status });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;