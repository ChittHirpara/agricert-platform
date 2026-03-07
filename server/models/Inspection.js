const mongoose = require('mongoose');

const InspectionSchema = new mongoose.Schema({
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  qaAgency: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  moisture: String,
  pesticide: String,
  organicStatus: String,
  isoCode: String,
  result: { type: String, enum: ['Pass', 'Fail'] },
  inspectionDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inspection', InspectionSchema);