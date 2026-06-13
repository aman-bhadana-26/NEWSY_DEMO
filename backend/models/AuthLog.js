const mongoose = require('mongoose');

const authLogSchema = new mongoose.Schema({
  provider: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    default: 'N/A'
  },
  email: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  verificationStatus: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('AuthLog', authLogSchema);
