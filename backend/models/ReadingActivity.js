const mongoose = require('mongoose');

const readingActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  articleUrl: {
    type: String,
    required: true,
    trim: true
  },
  articleTitle: {
    type: String,
    trim: true,
    default: ''
  },
  topic: {
    type: String,
    default: 'tech',
    enum: ['all', 'ai', 'startups', 'software', 'gadgets', 'cybersecurity', 'tech']
  },
  timeSpentSeconds: {
    type: Number,
    default: 0,
    min: 0
  },
  readAt: {
    type: Date,
    default: Date.now
  }
});

readingActivitySchema.index({ user: 1, readAt: -1 });
readingActivitySchema.index({ user: 1, articleUrl: 1, readAt: -1 });

module.exports = mongoose.model('ReadingActivity', readingActivitySchema);
