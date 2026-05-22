const express = require('express');
const router = express.Router();
const {
  getReactionsByArticle,
  toggleReaction
} = require('../controllers/reactionController');
const { protect, optionalProtect } = require('../middleware/auth');

router.get('/', optionalProtect, getReactionsByArticle);
router.post('/', protect, toggleReaction);

module.exports = router;
