const express = require('express');
const multer = require('multer');
const path = require('path');
const { extractDataFromImage } = require('../services/ocrService');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `ocr-${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only images are allowed for OCR fallback!'));
        }
        cb(null, true);
    }
});

// @route   POST /api/ocr/scan
// @desc    Scan document for inspection details
router.post('/scan', protect, authorize('certifier'), upload.single('document'), async (req, res, next) => {
    try {
        if (!req.file) {
            // Optional fallback: process already uploaded batch file if path provided in body
            const { existingFilePath, isDemo } = req.body;
            if (existingFilePath) {
                const fullPath = path.join(__dirname, '..', existingFilePath.replace(/^\//, ''));
                const ocrData = await extractDataFromImage(fullPath, isDemo === true || isDemo === 'true');
                return res.json({ ocrData, fileUrl: existingFilePath });
            }
            return res.status(400).json({ msg: 'Please upload an image or provide an existing file path' });
        }

        const { isDemo } = req.body;
        const ocrData = await extractDataFromImage(req.file.path, isDemo === true || isDemo === 'true');
        res.json({ ocrData, fileUrl: `/uploads/${req.file.filename}` });
    } catch (err) {
        if (err.message === "Invalid certification document") {
            return res.status(400).json({
                error: "Invalid certification document",
                message: "No crop quality data detected"
            });
        }
        if (err.message === "Incomplete OCR data") {
            return res.status(400).json({
                error: "Incomplete OCR data"
            });
        }
        next(err);
    }
});

module.exports = router;
