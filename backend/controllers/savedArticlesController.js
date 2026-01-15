const SavedArticle = require('../models/SavedArticle');

/**
 * @desc    Save an article
 * @route   POST /api/saved
 * @access  Private
 */
const saveArticle = async (req, res) => {
  try {
    const { title, description, url, urlToImage, publishedAt, source, category } = req.body;

    // Check if article already saved
    const existingArticle = await SavedArticle.findOne({
      user: req.user._id,
      url: url
    });

    if (existingArticle) {
      return res.status(400).json({ message: 'Article already saved' });
    }

    const savedArticle = await SavedArticle.create({
      user: req.user._id,
      title,
      description,
      url,
      urlToImage,
      publishedAt,
      source,
      category
    });

    res.status(201).json({
      success: true,
      article: savedArticle
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get user's saved articles
 * @route   GET /api/saved
 * @access  Private
 */
const getSavedArticles = async (req, res) => {
  try {
    const savedArticles = await SavedArticle.find({ user: req.user._id })
      .sort({ savedAt: -1 });

    res.json({
      success: true,
      articles: savedArticles
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Delete a saved article
 * @route   DELETE /api/saved/:id
 * @access  Private
 */
const deleteSavedArticle = async (req, res) => {
  try {
    const article = await SavedArticle.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if user owns the saved article
    if (article.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await article.deleteOne();

    res.json({ success: true, message: 'Article removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  saveArticle,
  getSavedArticles,
  deleteSavedArticle
};
