const { extractDataFromImage } = require('./server/services/ocrService');
const path = require('path');

async function testOCR() {
    const demoPath = path.join(__dirname, 'server', 'demo-assets', 'demo-certificate-1.png');
    console.log(`Testing OCR on: ${demoPath}`);
    try {
        const data = await extractDataFromImage(demoPath);
        console.log('OCR Success:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('OCR Failed:', err.message);
    }
}

testOCR();
