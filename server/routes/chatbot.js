const express = require('express');
const router = express.Router();

// Rule-based NLP responses
const responses = {
    certify: {
        keywords: ['certify', 'certification', 'certify crops', 'how to certify', 'certifier', 'inspection'],
        answer: 'To certify crops on AgriCert: 1) A farmer submits a crop batch with inspection documents. 2) A certified certifier scans the document using OCR. 3) The certifier reviews the results and either approves or rejects the batch. 4) Approved batches are recorded on the Polygon blockchain for tamper-proof verification.'
    },
    auction: {
        keywords: ['auction', 'bid', 'bidding', 'how do auctions work', 'buy', 'sell', 'real-time'],
        answer: 'Auctions on AgriCert: 1) Farmers start auctions for certified crop batches and set a starting price. 2) Distributors and consumers can place bids in real-time using our live bidding engine. 3) The highest bidder wins when the farmer ends the auction. 4) All auction data is transparent and traceable.'
    },
    verify: {
        keywords: ['verify', 'authenticity', 'verify authenticity', 'check product', 'trace', 'traceability', 'blockchain'],
        answer: 'To verify product authenticity: 1) Go to the Consumer Verification page. 2) Enter the Product ID (batch ID). 3) You will see the full supply chain: farmer details, certifier info, OCR inspection data, blockchain transaction hash, and auction results. Everything is stored on the Polygon blockchain for transparency.'
    },
    register: {
        keywords: ['register', 'sign up', 'create account', 'join'],
        answer: 'To register on AgriCert: Go to the registration page and enter your name, email, password, and select your role (farmer, certifier, distributor, or consumer). Each role has specific permissions on the platform.'
    },
    batch: {
        keywords: ['batch', 'crop', 'submit', 'upload', 'add crop'],
        answer: 'To submit a crop batch: 1) Log in as a farmer. 2) Navigate to your dashboard and click "Submit Batch". 3) Fill in crop name, quantity, and location. 4) Upload your inspection document (image or PDF). 5) Your batch will be submitted for certifier review.'
    }
};

// @route   POST /api/chatbot/ask
// @desc    Simple rule-based chatbot
router.post('/ask', (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ msg: 'Please provide a question' });
    }

    const lowerQuestion = question.toLowerCase();

    // Find matching response
    for (const key of Object.keys(responses)) {
        const entry = responses[key];
        const matched = entry.keywords.some(kw => lowerQuestion.includes(kw));
        if (matched) {
            return res.json({ answer: entry.answer, topic: key });
        }
    }

    // Default fallback
    res.json({
        answer: 'I can help you with: How to certify crops, How auctions work, How to verify product authenticity, How to register, and How to submit crop batches. Try asking about any of these topics!',
        topic: 'unknown'
    });
});

module.exports = router;
