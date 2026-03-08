const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cropName: { type: String, required: true },
  quantity: { type: String, required: true },
  location: { type: String, required: true },
  documentUrl: { type: String },
  status: {
    type: String,
    enum: ['pending', 'certified', 'rejected'],
    default: 'pending'
  },
  blockchainHash: { type: String, default: null },
  auctionStatus: {
    type: String,
    enum: ['pending', 'active', 'completed'],
    default: 'pending'
  },
  isDemo: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Batch', BatchSchema);