const express = require('express');
const router = express.Router();
const { getNews, getHeadlines, getTrendingNews, getArticleContent } = require('../controllers/newsController');

// Public routes - Order matters! Specific routes before general ones
router.get('/trending', getTrendingNews);
router.get('/headlines', getHeadlines);
router.post('/article-content', getArticleContent);
router.get('/', getNews);

module.exports = router;
