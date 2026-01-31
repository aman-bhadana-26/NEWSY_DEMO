const express = require('express');
const router = express.Router();
const {
  getMyNews,
  updatePreferences,
  getPreferences,
  saveArticle,
  unsaveArticle,
  getSavedArticles
} = require('../controllers/myNewsController');
const { protect } = require('../middleware/auth');

// All routes are protected - require authentication
router.get('/', protect, getMyNews);
router.get('/preferences', protect, getPreferences);
router.put('/preferences', protect, updatePreferences);
router.post('/save', protect, saveArticle);
router.delete('/save/:articleUrl', protect, unsaveArticle);
router.get('/saved', protect, getSavedArticles);

module.exports = router;
