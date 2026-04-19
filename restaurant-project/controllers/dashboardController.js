const User = require('../models/User');
const Food = require('../models/Food');
const Order = require('../models/Order');

exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).lean();

    if (user.role === 'admin') {
      // Admin stats
      const [totalFoods, totalOrders, totalUsers, recentOrders] = await Promise.all([
        Food.countDocuments(),
        Order.countDocuments(),
        User.countDocuments(),
        Order.find()
          .populate('customer', 'name email')
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
      ]);

      // Orders per day (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const ordersPerDay = await Order.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            revenue: { $sum: '$totalPrice' },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Category distribution of food items
      const categoryDist = await Food.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]);

      // Monthly revenue (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const monthlyRevenue = await Order.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            total: { $sum: '$totalPrice' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      res.render('dashboard/admin', {
        title: 'Admin Dashboard',
        user,
        totalFoods,
        totalOrders,
        totalUsers,
        recentOrders,
        ordersPerDay: JSON.stringify(ordersPerDay),
        categoryDist: JSON.stringify(categoryDist),
        monthlyRevenue: JSON.stringify(monthlyRevenue),
      });
    } else {
      // Customer dashboard
      const [foods, orders] = await Promise.all([
        Food.find({ available: true }).sort({ createdAt: -1 }).lean(),
        Order.find({ customer: req.session.userId })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
      ]);

      // Customer order history for chart
      const orderHistory = await Order.aggregate([
        { $match: { customer: user._id } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            spent: { $sum: '$totalPrice' },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 7 },
      ]);

      res.render('dashboard/customer', {
        title: 'My Dashboard',
        user,
        foods,
        orders,
        orderHistory: JSON.stringify(orderHistory),
      });
    }
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load dashboard.');
    res.redirect('/auth/login');
  }
};
