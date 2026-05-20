const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
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
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
    maxlength: [2000, 'Comment cannot exceed 2000 characters']
  }
}, {
  timestamps: true
});

commentSchema.index({ articleUrl: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
