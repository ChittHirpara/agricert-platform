const express = require('express');
const multer = require('multer');
const path = require('path');
const Batch = require('../models/Batch');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Images and PDFs only!'));
  }
});

// @route   POST /api/batches
// @desc    Submit a new crop batch for certification
router.post('/', protect, authorize('farmer'), upload.single('document'), async (req, res, next) => {
  try {
    const { cropName, quantity, location, isDemo } = req.body;
    let documentUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!documentUrl) {
      return res.status(400).json({ msg: 'Document upload is required' });
    }

    const newBatch = new Batch({
      farmerId: req.user.id,
      cropName,
      quantity,
      location,
      documentUrl,
      isDemo: isDemo === 'true' || isDemo === true
    });

    const batch = await newBatch.save();
    res.status(201).json(batch);
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/batches/my
// @desc    Get batches for logged in farmer
router.get('/my', protect, authorize('farmer'), async (req, res, next) => {
  try {
    const batches = await Batch.find({ farmerId: req.user.id }).sort({ createdAt: -1 });
    res.json(batches);
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/batches/pending
// @desc    Get pending batches for certifiers
router.get('/pending', protect, authorize('certifier'), async (req, res, next) => {
  try {
    const batches = await Batch.find({ status: 'pending' }).populate('farmerId', ['name', 'email']).sort({ createdAt: 1 });
    res.json(batches);
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/batches/:id
// @desc    Get batch by ID
router.get('/:id', protect, async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('farmerId', ['name', 'email'])
      .populate('auctionWinner', ['name', 'email']);

    if (!batch) return res.status(404).json({ msg: 'Batch not found' });
    res.json(batch);
  } catch (err) {
    next(err);
  }
});

module.exports = router;