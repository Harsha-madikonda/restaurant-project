const User = require('../models/User');

// GET /auth/login
exports.getLogin = (req, res) => {
  res.render('auth/login', { title: 'Login' });
};

// POST /auth/login
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash('error', 'Please provide email and password.');
      return res.redirect('/auth/login');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/auth/login');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/auth/login');
    }

    req.session.userId = user._id.toString();
    req.session.userRole = user.role;
    req.session.userName = user.name;

    req.flash('success', `Welcome back, ${user.name}!`);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/auth/login');
  }
};

// GET /auth/register
exports.getRegister = (req, res) => {
  res.render('auth/register', { title: 'Register' });
};

// POST /auth/register
exports.postRegister = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      req.flash('error', 'All fields are required.');
      return res.redirect('/auth/register');
    }

    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match.');
      return res.redirect('/auth/register');
    }

    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters.');
      return res.redirect('/auth/register');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      req.flash('error', 'Email already registered. Please login.');
      return res.redirect('/auth/register');
    }

    const allowedRoles = ['admin', 'customer'];
    const userRole = allowedRoles.includes(role) ? role : 'customer';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: userRole,
    });

    req.session.userId = user._id.toString();
    req.session.userRole = user.role;
    req.session.userName = user.name;

    req.flash('success', `Account created! Welcome, ${user.name}!`);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      req.flash('error', 'Email already registered.');
    } else {
      req.flash('error', 'Registration failed. Please try again.');
    }
    res.redirect('/auth/register');
  }
};

// POST /auth/logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Session destroy error:', err);
    res.clearCookie('connect.sid');
    res.redirect('/auth/login');
  });
};
