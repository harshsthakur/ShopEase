const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await User.find({});
    // Remove passwords before sending
    const safeUsers = users.map(user => {
      const u = typeof user.toObject === 'function' ? user.toObject() : user;
      delete u.password;
      return u;
    });
    res.json(safeUsers);
  } catch (error) {
    console.error('Fetch Users Error:', error);
    res.status(500).json({ message: 'Server error fetching customer accounts' });
  }
});

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
router.put('/:id/role', protect, admin, async (req, res) => {
  const { role } = req.body; // 'customer', 'admin'

  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'You cannot change your own role' });
      }

      user.role = role || user.role;
      const updatedUser = await User.findByIdAndUpdate(req.params.id, { role: user.role }, { new: true });
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update User Role Error:', error);
    res.status(500).json({ message: 'Server error updating user role' });
  }
});

// @desc    Delete user account (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'You cannot delete your own admin account' });
      }

      await User.findByIdAndDelete(req.params.id);
      res.json({ message: 'User account deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ message: 'Server error deleting user account' });
  }
});

module.exports = router;
