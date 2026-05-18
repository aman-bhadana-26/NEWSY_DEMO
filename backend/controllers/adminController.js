const User = require('../models/User');

/**
 * @desc    Get all users with pagination
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || 'all';
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status !== 'all') {
      query.status = status;
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getDashboardStats = async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments();
    
    // Active users
    const activeUsers = await User.countDocuments({ status: 'active' });
    
    // Suspended users
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });
    
    // Banned users
    const bannedUsers = await User.countDocuments({ status: 'banned' });
    
    // Admins
    const adminCount = await User.countDocuments({ isAdmin: true });
    
    // New users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    
    // New users this week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: startOfWeek }
    });
    
    // Users by status
    const usersByStatus = await User.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Recent users (last 10)
    const recentUsers = await User.find()
      .select('name email createdAt status')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      totalUsers,
      activeUsers,
      suspendedUsers,
      bannedUsers,
      adminCount,
      newUsersThisMonth,
      newUsersThisWeek,
      usersByStatus,
      recentUsers
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update user status
 * @route   PUT /api/admin/users/:id/status
 * @access  Private/Admin
 */
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'suspended', 'banned'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent admin from changing their own status
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot change your own status' });
    }
    
    user.status = status;
    await user.save();
    
    res.json({
      message: `User status updated to ${status}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Toggle admin status
 * @route   PUT /api/admin/users/:id/admin
 * @access  Private/Admin
 */
const toggleAdminStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent admin from removing their own admin status
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot change your own admin status' });
    }
    
    user.isAdmin = !user.isAdmin;
    await user.save();
    
    res.json({
      message: `User admin status ${user.isAdmin ? 'granted' : 'revoked'}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Toggle admin status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    await user.deleteOne();
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Bulk update users
 * @route   POST /api/admin/users/bulk-action
 * @access  Private/Admin
 */
const bulkUpdateUsers = async (req, res) => {
  try {
    const { userIds, action, value } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs required' });
    }
    
    // Prevent bulk action on self
    const adminId = req.user._id.toString();
    const filteredIds = userIds.filter(id => id !== adminId);
    
    if (filteredIds.length === 0) {
      return res.status(400).json({ message: 'Cannot perform bulk action on yourself' });
    }
    
    let updateQuery = {};
    
    switch (action) {
      case 'updateStatus':
        if (!['active', 'suspended', 'banned'].includes(value)) {
          return res.status(400).json({ message: 'Invalid status' });
        }
        updateQuery = { status: value };
        break;
        
      case 'delete':
        await User.deleteMany({ _id: { $in: filteredIds } });
        return res.json({ message: `${filteredIds.length} users deleted successfully` });
        
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }
    
    const result = await User.updateMany(
      { _id: { $in: filteredIds } },
      updateQuery
    );
    
    res.json({
      message: `${result.modifiedCount} users updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk update users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getDashboardStats,
  getUserById,
  updateUserStatus,
  toggleAdminStatus,
  deleteUser,
  bulkUpdateUsers
};
