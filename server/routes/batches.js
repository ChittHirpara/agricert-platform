const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Batch = require('../models/Batch');
const User = require('../models/User');

// Configure Storage for Files (Lab Reports/Images)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// @route   POST /api/batches
// @desc    Create a new batch with attachments
router.post('/', upload.array('attachments'), async (req, res) => {
  try {
    // "req.body" has the text data
    // "req.files" has the uploaded files
    const { exporterId, productType, quantity, location, destination } = req.body;

    const attachments = req.files.map(file => ({
      fileUrl: `/uploads/${file.filename}`,
      fileType: file.mimetype
    }));

    const newBatch = new Batch({
      exporter: exporterId,
      productType,
      quantity,
      location,
      destination,
      attachments
    });

    const batch = await newBatch.save();
    res.json(batch);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/batches/:userId
// @desc    Get all batches for a specific user
router.get('/:userId', async (req, res) => {
  try {
    const batches = await Batch.find({ exporter: req.params.userId }).sort({ createdAt: -1 });
    res.json(batches);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/batches/verify/:id
// @desc    Get a single batch by ID (Public Access)
router.get('/verify/:id', async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id).populate('exporter', 'username');
    if (!batch) return res.status(404).json({ msg: 'Batch not found' });
    res.json(batch);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});
// @route   DELETE /api/batches/:id
// @desc    Delete a batch
router.delete('/:id', async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    
    if (!batch) {
      return res.status(404).json({ msg: 'Batch not found' });
    }

    // In a real app, check if user owns the batch, but for hackathon, just delete
    await Batch.findByIdAndDelete(req.params.id);
    
    res.json({ msg: 'Batch removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
// @route   GET /api/batches/market/all
// @desc    Get ONLY Certified batches for Importers to buy
router.get('/market/all', async (req, res) => {
  try {
    const batches = await Batch.find({ status: 'Certified' }).populate('exporter', 'username');
    res.json(batches);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});
// @route   PUT /api/batches/order/:id
// @desc    Importer places an order
router.put('/order/:id', async (req, res) => {
  try {
    const { buyerId } = req.body;
    await Batch.findByIdAndUpdate(req.params.id, { 
      orderedBy: buyerId,
      orderStatus: 'Pending'
    });
    res.json({ msg: 'Order Placed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/batches/ship/:id
// @desc    Exporter approves shipment
router.put('/ship/:id', async (req, res) => {
  try {
    await Batch.findByIdAndUpdate(req.params.id, { orderStatus: 'Shipped' });
    res.json({ msg: 'Shipment Approved' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/batches/decline/:id
// @desc    Exporter declines shipment
router.put('/decline/:id', async (req, res) => {
  try {
    await Batch.findByIdAndUpdate(req.params.id, { orderStatus: 'Declined' });
    res.json({ msg: 'Order Declined' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;