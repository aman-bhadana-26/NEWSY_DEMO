const mongoose = require('mongoose');

const REACTION_TYPES = ['like', 'love', 'insightful', 'wow'];

const articleReactionSchema = new mongoose.Schema({
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
  type: {
    type: String,
    required: true,
    enum: REACTION_TYPES
  }
}, {
  timestamps: true
});

articleReactionSchema.index({ articleUrl: 1, type: 1 });
articleReactionSchema.index({ user: 1, articleUrl: 1 }, { unique: true });

module.exports = mongoose.model('ArticleReaction', articleReactionSchema);
module.exports.REACTION_TYPES = REACTION_TYPES;
