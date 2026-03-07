const Batch = require('../models/Batch');

class AuctionService {
    constructor() {
        this.auctions = new Map(); // Store active auctions in memory: { productId: { highestBid: number, highestBidder: userId, ... } }
    }

    /**
     * Validates a bid against the current highest bid for a product.
     * @param {string} productId - The ID of the batch/product
     * @param {number} amount - The bid amount
     * @param {string} userId - The ID of the bidder
     * @returns {Object} { isValid: boolean, error?: string, highestBid?: number }
     */
    async processBid(productId, amount, userId) {
        if (!this.auctions.has(productId)) {
            // Initialize an auction if one doesn't exist for this product yet.
            // In a full DB setup, you'd fetch the starting price from the DB and verify status.
            this.auctions.set(productId, { highestBid: 0, highestBidder: null });
        }

        const auction = this.auctions.get(productId);

        if (amount <= auction.highestBid) {
            return {
                isValid: false,
                error: `Bid must be higher than current highest bid (${auction.highestBid})`
            };
        }

        // Bid is valid
        auction.highestBid = amount;
        auction.highestBidder = userId;

        // Save state back
        this.auctions.set(productId, auction);

        return {
            isValid: true,
            highestBid: amount,
            highestBidder: userId
        };
    }

    /**
     * Retrieves the current state of an auction
     */
    getAuctionState(productId) {
        return this.auctions.get(productId) || { highestBid: 0, highestBidder: null };
    }
}

module.exports = new AuctionService();
