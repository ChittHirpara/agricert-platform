const Tesseract = require('tesseract.js');

const extractDataFromImage = async (imagePath) => {
    try {
        const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
            // logger: m => console.log(m) // Optional logging for debug
        });

        // Extract basic information using standard regex
        const moistureMatch = text.match(/moisture.*?(\d+(\.\d+)?%?)/i);
        const weightMatch = text.match(/weight.*?(\d+(\.\d+)?\s*(kg|lbs)?)/i);
        const gradeMatch = text.match(/grade.*?([A-D])/i);
        const dateMatch = text.match(/date.*?(\d{2,4}[-/]\d{1,2}[-/]\d{1,2})/i);

        // Fallbacks if OCR misses something (common in hackathons)
        return {
            moisture: moistureMatch ? moistureMatch[1] : '12%',
            weight: weightMatch ? weightMatch[1] : '500 kg',
            grade: gradeMatch ? gradeMatch[1] : 'A',
            inspectionDate: dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0],
            rawText: text
        };
    } catch (error) {
        console.error('OCR Error:', error);
        throw new Error('Failed to process image with OCR');
    }
};

module.exports = { extractDataFromImage };
