const User = require('../models/User');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');

// GET /users - Admin: list all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();

    // Get order count per user
    const userIds = users.map((u) => u._id);
    const orderCounts = await Order.aggregate([
      { $match: { customer: { $in: userIds } } },
      { $group: { _id: '$customer', count: { $sum: 1 } } },
    ]);

    const orderMap = {};
    orderCounts.forEach((o) => { orderMap[o._id.toString()] = o.count; });

    const usersWithOrders = users.map((u) => ({
      ...u,
      orderCount: orderMap[u._id.toString()] || 0,
    }));

    res.render('users/list', { title: 'User Management', users: usersWithOrders });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load users.');
    res.redirect('/dashboard');
  }
};

// PUT /users/:id/role - Admin: update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'customer'].includes(role)) {
      req.flash('error', 'Invalid role.');
      return res.redirect('/users');
    }

    // Prevent self-demotion if only admin
    if (req.params.id === req.session.userId && role === 'customer') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        req.flash('error', 'Cannot remove the last admin.');
        return res.redirect('/users');
      }
    }

    await User.findByIdAndUpdate(req.params.id, { role });
    req.flash('success', 'User role updated successfully.');
    res.redirect('/users');
  } catch (err) {
    req.flash('error', 'Failed to update role.');
    res.redirect('/users');
  }
};

// DELETE /users/:id - Admin: delete user
exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.session.userId) {
      req.flash('error', 'You cannot delete your own account.');
      return res.redirect('/users');
    }
    await User.findByIdAndDelete(req.params.id);
    await Order.deleteMany({ customer: req.params.id });
    req.flash('success', 'User and their orders deleted successfully.');
    res.redirect('/users');
  } catch (err) {
    req.flash('error', 'Failed to delete user.');
    res.redirect('/users');
  }
};

// GET /profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password').lean();
    const orderCount = await Order.countDocuments({ customer: req.session.userId });
    res.render('profile/index', { title: 'My Profile', user, orderCount });
  } catch (err) {
    req.flash('error', 'Failed to load profile.');
    res.redirect('/dashboard');
  }
};

// PUT /profile - Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      req.flash('error', 'Name and email are required.');
      return res.redirect('/profile');
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
      _id: { $ne: req.session.userId },
    });

    if (existingUser) {
      req.flash('error', 'Email already in use by another account.');
      return res.redirect('/profile');
    }

    const updateData = { name: name.trim(), email: email.toLowerCase().trim() };
    if (req.file) updateData.avatar = '/uploads/' + req.file.filename;

    await User.findByIdAndUpdate(req.session.userId, updateData);
    req.session.userName = name.trim();

    req.flash('success', 'Profile updated successfully!');
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update profile.');
    res.redirect('/profile');
  }
};

// PUT /profile/password - Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      req.flash('error', 'All password fields are required.');
      return res.redirect('/profile');
    }

    if (newPassword !== confirmPassword) {
      req.flash('error', 'New passwords do not match.');
      return res.redirect('/profile');
    }

    if (newPassword.length < 6) {
      req.flash('error', 'New password must be at least 6 characters.');
      return res.redirect('/profile');
    }

    const user = await User.findById(req.session.userId);
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      req.flash('error', 'Current password is incorrect.');
      return res.redirect('/profile');
    }

    user.password = newPassword;
    await user.save();

    req.flash('success', 'Password changed successfully!');
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to change password.');
    res.redirect('/profile');
  }
};
