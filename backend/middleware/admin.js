const User = require('../models/User');

/**
 * Middleware to check if user is an admin
 * Must be used after protect middleware
 */
const adminOnly = async (req, res, next) => {
  try {
    // User should already be authenticated by protect middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, please log in' });
    }

    // Check if user is admin
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    // User is admin, proceed
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ 
      message: 'Server error in admin authorization',
      error: error.message 
    });
  }
};

module.exports = { adminOnly };
