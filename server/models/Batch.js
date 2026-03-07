const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
  exporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productType: { type: String, required: true },
  quantity: { type: String, required: true },
  location: { type: String, required: true },
  destination: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Submitted', 'Under Inspection', 'Certified', 'Rejected'], 
    default: 'Submitted' 
  },
  // --- NEW FIELDS FOR ORDER SYSTEM ---
  orderedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  orderStatus: { 
    type: String, 
    enum: ['None', 'Pending', 'Shipped', 'Declined'], 
    default: 'None' 
  },
  // -----------------------------------
  attachments: [{ fileUrl: String, fileType: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Batch', BatchSchema);