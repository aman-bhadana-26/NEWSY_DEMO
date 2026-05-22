const ArticleReaction = require('../models/ArticleReaction');
const { REACTION_TYPES } = require('../models/ArticleReaction');

const emptyCounts = () =>
  REACTION_TYPES.reduce((acc, type) => {
    acc[type] = 0;
    return acc;
  }, {});

const aggregateCounts = (rows) => {
  const counts = emptyCounts();
  let total = 0;
  for (const row of rows) {
    if (counts[row._id] !== undefined) {
      counts[row._id] = row.count;
      total += row.count;
    }
  }
  return { counts, total };
};

/**
 * @desc    Get reaction counts for an article (optional user reaction if logged in)
 * @route   GET /api/reactions?articleUrl=...
 * @access  Public (userReaction when token present)
 */
const getReactionsByArticle = async (req, res) => {
  try {
    const { articleUrl } = req.query;

    if (!articleUrl) {
      return res.status(400).json({ message: 'articleUrl is required' });
    }

    const trimmedUrl = articleUrl.trim();

    const grouped = await ArticleReaction.aggregate([
      { $match: { articleUrl: trimmedUrl } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const { counts, total } = aggregateCounts(grouped);

    let userReaction = null;
    if (req.user) {
      const mine = await ArticleReaction.findOne({
        user: req.user._id,
        articleUrl: trimmedUrl
      }).select('type');
      userReaction = mine?.type || null;
    }

    res.json({ counts, total, userReaction, types: REACTION_TYPES });
  } catch (error) {
    console.error('Get reactions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Toggle or set a reaction (same type removes it)
 * @route   POST /api/reactions
 * @access  Private
 */
const toggleReaction = async (req, res) => {
  try {
    const { articleUrl, articleTitle, type } = req.body;

    if (!articleUrl?.trim() || !type) {
      return res.status(400).json({ message: 'articleUrl and type are required' });
    }

    if (!REACTION_TYPES.includes(type)) {
      return res.status(400).json({ message: 'Invalid reaction type' });
    }

    const trimmedUrl = articleUrl.trim();
    const existing = await ArticleReaction.findOne({
      user: req.user._id,
      articleUrl: trimmedUrl
    });

    if (existing) {
      if (existing.type === type) {
        await existing.deleteOne();
      } else {
        existing.type = type;
        if (articleTitle?.trim()) {
          existing.articleTitle = articleTitle.trim();
        }
        await existing.save();
      }
    } else {
      await ArticleReaction.create({
        user: req.user._id,
        articleUrl: trimmedUrl,
        articleTitle: articleTitle?.trim() || '',
        type
      });
    }

    const grouped = await ArticleReaction.aggregate([
      { $match: { articleUrl: trimmedUrl } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const { counts, total } = aggregateCounts(grouped);

    const mine = await ArticleReaction.findOne({
      user: req.user._id,
      articleUrl: trimmedUrl
    }).select('type');

    res.json({
      counts,
      total,
      userReaction: mine?.type || null
    });
  } catch (error) {
    console.error('Toggle reaction error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getReactionsByArticle,
  toggleReaction
};
