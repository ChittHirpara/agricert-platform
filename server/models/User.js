const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true }, // <--- Added Email
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['exporter', 'qa', 'admin', 'importer'], 
    required: true 
  },
  walletAddress: { type: String }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);