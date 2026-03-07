const mongoose = require('mongoose');

const InspectionSchema = new mongoose.Schema({
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  certifierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ocrData: {
    moisture: { type: String },
    weight: { type: String },
    grade: { type: String },
    inspectionDate: { type: String }
  },
  status: {
    type: String,
    enum: ['approved', 'rejected'],
    required: true
  },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inspection', InspectionSchema);