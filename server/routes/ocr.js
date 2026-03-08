const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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
        const uploadedFilePath = req.file.path;
        const ocrData = await extractDataFromImage(uploadedFilePath, isDemo === true || isDemo === 'true');

        // Cleanup: Remove original uploaded file after OCR to prevent disk bloat
        try { fs.unlinkSync(uploadedFilePath); } catch (e) { console.warn('[OCR] Could not remove uploaded file:', e.message); }

        res.json({ ocrData, fileUrl: `/uploads/${req.file.filename}` });
    } catch (err) {
        // Cleanup on error too
        if (req.file && req.file.path) {
            try { fs.unlinkSync(req.file.path); } catch (e) { }
        }
        if (err.message === 'Invalid certification document') {
            return res.status(400).json({
                error: 'Invalid certification document',
                message: 'The uploaded file does not appear to be a crop quality certificate. Please upload an image containing moisture, grade, and weight data.'
            });
        }
        if (err.message.startsWith('Incomplete OCR data')) {
            return res.status(400).json({
                error: 'Incomplete OCR data',
                message: `Could not extract all required fields. ${err.message}. Please ensure your certificate image is clear and well-lit.`
            });
        }
        if (err.message === 'Document file not found on server') {
            return res.status(404).json({
                error: 'File not found',
                message: 'The batch document could not be located on the server. Please re-upload.'
            });
        }
        if (err.message === 'Document file is empty') {
            return res.status(400).json({
                error: 'Empty file',
                message: 'The uploaded file is empty. Please upload a valid certificate image.'
            });
        }
        next(err);
    }
});

module.exports = router;
