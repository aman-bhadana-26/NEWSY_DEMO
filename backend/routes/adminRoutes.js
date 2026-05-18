const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getDashboardStats,
  getUserById,
  updateUserStatus,
  toggleAdminStatus,
  deleteUser,
  bulkUpdateUsers
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// All routes are protected and admin-only
router.use(protect);
router.use(adminOnly);

// Dashboard stats
router.get('/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/admin', toggleAdminStatus);
router.delete('/users/:id', deleteUser);

// Bulk actions
router.post('/users/bulk-action', bulkUpdateUsers);

module.exports = router;
