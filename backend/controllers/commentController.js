const Comment = require('../models/Comment');

/**
 * @desc    Get comments for an article
 * @route   GET /api/comments?articleUrl=...
 * @access  Public
 */
const getCommentsByArticle = async (req, res) => {
  try {
    const { articleUrl } = req.query;

    if (!articleUrl) {
      return res.status(400).json({ message: 'articleUrl is required' });
    }

    const comments = await Comment.find({ articleUrl })
      .populate('user', 'name profilePicture')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      comments: comments.map((c) => ({
        _id: c._id,
        text: c.text,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        user: c.user
          ? {
              _id: c.user._id,
              name: c.user.name,
              profilePicture: c.user.profilePicture
            }
          : { name: 'Unknown' }
      })),
      count: comments.length
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Create a comment
 * @route   POST /api/comments
 * @access  Private
 */
const createComment = async (req, res) => {
  try {
    const { articleUrl, articleTitle, text } = req.body;

    if (!articleUrl || !text?.trim()) {
      return res.status(400).json({ message: 'articleUrl and text are required' });
    }

    if (text.trim().length > 2000) {
      return res.status(400).json({ message: 'Comment cannot exceed 2000 characters' });
    }

    const comment = await Comment.create({
      user: req.user._id,
      articleUrl: articleUrl.trim(),
      articleTitle: articleTitle?.trim() || '',
      text: text.trim()
    });

    await comment.populate('user', 'name profilePicture');

    res.status(201).json({
      _id: comment._id,
      text: comment.text,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: {
        _id: comment.user._id,
        name: comment.user.name,
        profilePicture: comment.user.profilePicture
      }
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update own comment
 * @route   PUT /api/comments/:id
 * @access  Private
 */
const updateComment = async (req, res) => {
  try {
    const { text } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }

    if (!text?.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    comment.text = text.trim();
    await comment.save();
    await comment.populate('user', 'name profilePicture');

    res.json({
      _id: comment._id,
      text: comment.text,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: {
        _id: comment.user._id,
        name: comment.user.name,
        profilePicture: comment.user.profilePicture
      }
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Delete own comment (or admin)
 * @route   DELETE /api/comments/:id
 * @access  Private
 */
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const isOwner = comment.user.toString() === req.user._id.toString();
    const isAdmin = req.user.isAdmin;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getCommentsByArticle,
  createComment,
  updateComment,
  deleteComment
};
