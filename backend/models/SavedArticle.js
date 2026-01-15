const mongoose = require('mongoose');

const savedArticleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  url: {
    type: String,
    required: true
  },
  urlToImage: {
    type: String
  },
  publishedAt: {
    type: Date
  },
  source: {
    type: String
  },
  category: {
    type: String
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate saves
savedArticleSchema.index({ user: 1, url: 1 }, { unique: true });

module.exports = mongoose.model('SavedArticle', savedArticleSchema);
