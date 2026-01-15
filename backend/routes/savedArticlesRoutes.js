const express = require('express');
const router = express.Router();
const {
  saveArticle,
  getSavedArticles,
  deleteSavedArticle
} = require('../controllers/savedArticlesController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.route('/')
  .post(protect, saveArticle)
  .get(protect, getSavedArticles);

router.delete('/:id', protect, deleteSavedArticle);

module.exports = router;
