// Ensure user is authenticated
const ensureAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  req.flash('error', 'Please log in to access this page.');
  res.redirect('/auth/login');
};

// Ensure user is NOT authenticated (for login/register pages)
const ensureGuest = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  next();
};

// Ensure user is admin
const ensureAdmin = (req, res, next) => {
  if (req.session && req.session.userId && req.session.userRole === 'admin') {
    return next();
  }
  req.flash('error', 'Access denied. Admin only.');
  res.redirect('/dashboard');
};

// Ensure user is customer
const ensureCustomer = (req, res, next) => {
  if (req.session && req.session.userId && req.session.userRole === 'customer') {
    return next();
  }
  req.flash('error', 'Access denied. Customers only.');
  res.redirect('/dashboard');
};

// Attach user to res.locals for views
const attachUser = async (req, res, next) => {
  if (req.session && req.session.userId) {
    try {
      const User = require('../models/User');
      const user = await User.findById(req.session.userId).lean();
      res.locals.currentUser = user;
      res.locals.isAdmin = user && user.role === 'admin';
    } catch (err) {
      res.locals.currentUser = null;
      res.locals.isAdmin = false;
    }
  } else {
    res.locals.currentUser = null;
    res.locals.isAdmin = false;
  }
  next();
};

module.exports = { ensureAuth, ensureGuest, ensureAdmin, ensureCustomer, attachUser };
