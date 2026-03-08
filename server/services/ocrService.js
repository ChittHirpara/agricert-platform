const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function preprocessImage(inputPath) {
    const ext = path.extname(inputPath);
    const outputPath = inputPath.replace(ext, `-clean${ext}`);

    await sharp(inputPath)
        .grayscale()
        .normalize()
        .sharpen()
        .threshold(150)
        .toFile(outputPath);

    return outputPath;
}

function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function getPrediction(data) {
    let probability;
    let suggestion;

    if (data.moisture < 13 && data.grade === "A") {
        probability = 0.9;
        suggestion = "Excellent crop quality";
    } else if (data.moisture < 15) {
        probability = 0.7;
        suggestion = "Acceptable but store in dry conditions";
    } else {
        probability = 0.4;
        suggestion = "High moisture risk";
    }

    return { probability, suggestion };
}

const extractDataFromImage = async (imagePath, isDemo = false) => {
    let cleanImagePath = null;
    try {
        console.log(`[OCR] Preprocessing image: ${imagePath} (isDemo: ${isDemo})`);
        cleanImagePath = await preprocessImage(imagePath);

        console.log(`[OCR] Running Tesseract on: ${cleanImagePath}`);
        const worker = await Tesseract.createWorker('eng');
        await worker.setParameters({
            tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:%-kg "
        });

        const { data } = await worker.recognize(cleanImagePath);
        const rawText = data.text;
        await worker.terminate();

        const normalizedText = normalizeText(rawText);
        console.log("[OCR] Normalized Raw extracted text:", normalizedText);

        // Realistic agricultural keywords for validation
        const keywords = ["moisture", "grade", "inspection", "certificate", "weight"];
        const keywordCount = keywords.filter(word => normalizedText.includes(word)).length;

        // Strict validation for real certificates
        if (!isDemo && keywordCount < 1) {
            throw new Error("Invalid certification document");
        }

        const moistureRegex = /moisture[:\s]*([\d]{1,2})\s*%/i;
        const weightRegex = /weight[:\s]*([\d]{1,6})\s*(kg|tons)/i;
        const gradeRegex = /grade[:\s]*([a-z])/i;
        const dateRegex = /date[:\s]*([\d]{4}-[\d]{2}-[\d]{2})/i;

        const moistureMatch = normalizedText.match(moistureRegex);
        const weightMatch = normalizedText.match(weightRegex);
        const gradeMatch = normalizedText.match(gradeRegex);
        const dateMatch = normalizedText.match(dateRegex);

        // Data mapping with demo mode fallbacks
        const parsedData = {
            moisture: moistureMatch?.[1] ? `${moistureMatch[1]}%` : (isDemo ? "12%" : undefined),
            weight: weightMatch ? `${weightMatch[1]} ${weightMatch[2]}` : (isDemo ? "1.2 Metric Tons" : undefined),
            grade: gradeMatch?.[1]?.toUpperCase() || (isDemo ? "A" : undefined),
            inspectionDate: dateMatch?.[1] || new Date().toISOString().split('T')[0]
        };

        console.log("[OCR] Parsed:", parsedData);

        // Strict completeness check for real certificates
        if (!isDemo && (!parsedData.moisture || !parsedData.weight || !parsedData.grade)) {
            throw new Error("Incomplete OCR data");
        }

        const predictionNumericData = {
            moisture: moistureMatch ? parseFloat(moistureMatch[1]) : 12,
            weight: weightMatch ? parseFloat(weightMatch[1]) : 1200,
            grade: parsedData.grade || "A"
        };

        const prediction = getPrediction(predictionNumericData);

        return {
            moisture: parsedData.moisture,
            weight: parsedData.weight,
            grade: parsedData.grade,
            inspectionDate: parsedData.inspectionDate,
            confidence: data.confidence || 91,
            prediction: prediction
        };
    } catch (error) {
        console.error('[OCR] Error:', error.message);
        throw error;
    } finally {
        if (cleanImagePath && fs.existsSync(cleanImagePath)) {
            try { fs.unlinkSync(cleanImagePath); } catch (e) { }
        }
    }
};

module.exports = { extractDataFromImage };
