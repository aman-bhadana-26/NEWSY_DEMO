const express = require('express');
const router = express.Router();
const {
  trackReading,
  getUserAnalytics,
  getSiteAnalytics
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.post('/track', protect, trackReading);
router.get('/me', protect, getUserAnalytics);
router.get('/site', protect, adminOnly, getSiteAnalytics);

module.exports = router;
