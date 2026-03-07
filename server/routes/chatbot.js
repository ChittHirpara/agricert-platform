const express = require('express');
const router = express.Router();

// Simple rule-based chatbot for hackathon
router.post('/ask', async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ error: "Question is required" });
        }

        const q = question.toLowerCase();
        let answer = "I'm unsure. Could you rephrase your question?";

        if (q.includes("certify") || q.includes("process") || q.includes("how")) {
            answer = "To certify a crop: 1. A Farmer uploads a batch. 2. A QA/Certifier verifies the crop physically and uploads the certification certificate. 3. Our system scans it via OCR. 4. The Certifier approves it. 5. It gets hashed to the Polygon blockchain for immutability! 6. Now it's ready for auction.";
        } else if (q.includes("quality") || q.includes("standards")) {
            answer = "Quality standards are verified by registered QA Agencies. They check moisture content, organic status, pesticide levels, and overall grade, typically using an ISO standard format.";
        } else if (q.includes("auction") || q.includes("bid")) {
            answer = "Once a crop batch is certified, its auctionStatus becomes 'active'. Distributors can join the auction room and place live bids. The highest bid wins.";
        } else if (q.includes("blockchain") || q.includes("polygon")) {
            answer = "We use the Polygon Amoy testnet. When a certification is approved, its critical data is hashed and stored in our AgriCert smart contract. This provides an immutable, transparent trail for consumers.";
        } else if (q.includes("verify") || q.includes("consumer") || q.includes("authentic")) {
            answer = "Consumers can use our Verification Portal. By querying a product ID, they can view the full history, the OCR data, and the immutable blockchain transaction hash.";
        } else if (q.includes("hello") || q.includes("hi")) {
            answer = "Hello! I am the AgriCert AI Assistant. How can I help you today? You can ask me about the certification process, quality standards, auctions, blockchain, or verification.";
        }

        res.json({ answer });
    } catch (error) {
        console.error("Chatbot Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;
