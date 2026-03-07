const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  vcData: { type: Object }, // Stores the full JSON VC from Inji
  issuedAt: { type: Date, default: Date.now },
  isRevoked: { type: Boolean, default: false }
});

module.exports = mongoose.model('Certificate', CertificateSchema);