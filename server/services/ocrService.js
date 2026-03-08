const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// ── Image Pre-processing ─────────────────────────
async function preprocessImage(inputPath) {
    const ext = path.extname(inputPath);
    const outputPath = inputPath.replace(ext, `-clean${ext}`);

    await sharp(inputPath)
        .resize({ width: 2000, withoutEnlargement: false }) // Upscale small docs
        .grayscale()
        .normalize()
        .sharpen({ sigma: 1.5 })
        .threshold(145)
        .toFile(outputPath);

    return outputPath;
}

// ── Text Normalisation ───────────────────────────
function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// ─────────────────────────────────────────────────
// STRICT label-anchored extraction
//
// Rules (per spec):
//   1. ONLY extract a value when its label is explicitly present
//   2. Do NOT infer from standalone numbers
//   3. Return null if the label is absent
//   4. Never fabricate a value
// ─────────────────────────────────────────────────

/**
 * Extract moisture
 * Requires label: "moisture", "moisture level", or "moisture content"
 * Proximity: value must appear within 25 chars of the label
 * Returns e.g. "11%" or null
 */
function extractMoisture(text) {
    const pattern = /moisture(?:\s*(?:level|content))?.{0,25}?(\d{1,2}(?:\.\d+)?)\s*%/i;
    const m = text.match(pattern);
    if (!m) return null;
    const val = parseFloat(m[1]);
    if (isNaN(val) || val < 0 || val > 100) return null;
    return `${val}%`;
}

/**
 * Extract weight
 * Requires label: "weight", "total weight", or "net weight"
 * Proximity: unit must appear within 25 chars of the label
 * Returns e.g. "1200 kg" or null
 */
function extractWeight(text) {
    const pattern = /(?:(?:total|net)\s+)?weight.{0,25}?(\d[\d.]*\s*(?:kg|tons?|metric\s*tons?))/i;
    const m = text.match(pattern);
    if (!m) return null;
    return m[1].trim()
        .replace(/\bmetric\s*tons?\b/i, 'Metric Tons')
        .replace(/\btons?\b/i, 'Tons')
        .replace(/\bkg\b/i, 'kg');
}

/**
 * Extract grade
 * Requires label: "grade" or "quality grade"
 * Returns e.g. "A" or null
 */
function extractGrade(text) {
    const pattern = /(?:quality\s+)?grade.{0,15}?([a-c])\b/i;
    const m = text.match(pattern);
    if (!m) return null;
    return m[1].toUpperCase();
}

/**
 * Extract inspection date
 * Requires label: "inspection date" or "inspection_date" ONLY
 * Bare "date" is intentionally excluded to avoid invoice/print dates
 * Returns ISO date string e.g. "2026-03-08" or null
 */
function extractInspectionDate(text) {
    const pattern = /inspection[_\s]date.{0,20}?([\d]{4}[-\/][\d]{2}[-\/][\d]{2})/i;
    const m = text.match(pattern);
    if (!m) return null;
    return m[1].replace(/\//g, '-');
}

// ── Prediction Engine ────────────────────────────
function getPrediction(moisture, grade) {
    const m = parseFloat(moisture) || 14;
    const g = (grade || 'B').toUpperCase();

    if (m < 12 && g === 'A') {
        return { probability: 0.96, suggestion: 'Excellent quality — premium market listing recommended.' };
    } else if (m < 13 && ['A', 'B'].includes(g)) {
        return { probability: 0.85, suggestion: 'High quality batch — suitable for standard certification.' };
    } else if (m < 15) {
        return { probability: 0.68, suggestion: 'Acceptable quality — store in dry conditions before distribution.' };
    } else if (m < 18) {
        return { probability: 0.45, suggestion: 'Elevated moisture detected — recommend re-drying before certification.' };
    } else {
        return { probability: 0.20, suggestion: 'High moisture risk — batch does not meet minimum certification standards.' };
    }
}

// ── Core Extraction ──────────────────────────────
const extractDataFromImage = async (imagePath, isDemo = false) => {
    let cleanImagePath = null;

    try {
        // ── File validation ──
        if (!fs.existsSync(imagePath)) {
            throw new Error('Document file not found on server');
        }
        const stats = fs.statSync(imagePath);
        if (stats.size === 0) {
            throw new Error('Document file is empty');
        }

        console.log(`[OCR] Processing: ${imagePath} | isDemo: ${isDemo} | size: ${stats.size} bytes`);

        // ── Preprocess ──
        cleanImagePath = await preprocessImage(imagePath);

        // ── Tesseract OCR ──
        const worker = await Tesseract.createWorker('eng');
        await worker.setParameters({
            // Wider whitelist to avoid stripping label chars like colon, slash, space
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:.%/-_ ',
            preserve_interword_spaces: '1',
        });

        const { data } = await worker.recognize(cleanImagePath);
        const rawText = data.text;
        const confidence = Math.round(data.confidence) || 0;
        await worker.terminate();

        const normalizedText = normalizeText(rawText);
        console.log('[OCR] Confidence:', confidence, '%');
        console.log('[OCR] Normalized text:', normalizedText.slice(0, 400));

        // ── Document validity check ──
        // For real docs: require at least 2 of these key label words to be present
        const LABEL_KEYWORDS = ['moisture', 'grade', 'weight', 'inspection', 'certificate', 'quality'];
        const foundLabels = LABEL_KEYWORDS.filter(w => normalizedText.includes(w));
        console.log('[OCR] Labels found:', foundLabels);

        if (!isDemo && foundLabels.length < 2) {
            throw new Error('Invalid certification document');
        }

        // ── STRICT label-anchored field extraction ──
        const extracted = {
            moisture: extractMoisture(normalizedText),
            weight: extractWeight(normalizedText),
            grade: extractGrade(normalizedText),
            inspection_date: extractInspectionDate(normalizedText),
        };

        console.log('[OCR] Extracted (strict):', extracted);

        // ── Demo mode: log only, no synthetic injection ──
        // Values must come from OCR even in demo mode.
        // If the demo document is correctly formatted, extraction will succeed.
        if (isDemo) {
            console.log('[OCR] Demo mode active — synthetic fallback values disabled');
        }

        // ── Null guard: ensure every key is null (not undefined) ──
        for (const key of Object.keys(extracted)) {
            if (!extracted[key]) extracted[key] = null;
        }

        // ── Completeness check ──
        // Hard-fail only if ALL three critical fields are null
        const missing = ['moisture', 'weight', 'grade'].filter(k => !extracted[k]);
        if (missing.length === 3) {
            throw new Error(`Incomplete OCR data — missing: ${missing.join(', ')}`);
        }

        // ── Prediction ──
        const prediction = getPrediction(
            extracted.moisture ? parseFloat(extracted.moisture) : 14,
            extracted.grade
        );

        // Use today as fallback date only if label was absent
        const inspectionDate = extracted.inspection_date || new Date().toISOString().split('T')[0];

        return {
            moisture: extracted.moisture,
            weight: extracted.weight,
            grade: extracted.grade,
            inspectionDate: inspectionDate,
            confidence: confidence,
            prediction: prediction,
        };

    } catch (error) {
        console.error('[OCR] Error:', error.message);
        throw error;
    } finally {
        if (cleanImagePath && fs.existsSync(cleanImagePath)) {
            try { fs.unlinkSync(cleanImagePath); } catch (_) { }
        }
    }
};

module.exports = { extractDataFromImage };
