const Order = require('../models/Order');
const Food = require('../models/Food');

// GET /orders - Admin: all orders, Customer: their orders
exports.getOrders = async (req, res) => {
  try {
    let orders;
    if (req.session.userRole === 'admin') {
      orders = await Order.find()
        .populate('customer', 'name email')
        .sort({ createdAt: -1 })
        .lean();
    } else {
      orders = await Order.find({ customer: req.session.userId })
        .sort({ createdAt: -1 })
        .lean();
    }
    res.render('orders/list', { title: 'Orders', orders });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load orders.');
    res.redirect('/dashboard');
  }
};

// GET /orders/cart - Customer: view cart/place order page
exports.getCart = async (req, res) => {
  try {
    const foods = await Food.find({ available: true }).lean();
    res.render('orders/cart', { title: 'Place Order', foods });
  } catch (err) {
    req.flash('error', 'Failed to load menu.');
    res.redirect('/dashboard');
  }
};

// POST /orders - Place an order
exports.placeOrder = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      req.flash('error', 'Your cart is empty.');
      return res.redirect('/orders/cart');
    }

    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      if (!item.foodId || !item.quantity || parseInt(item.quantity) < 1) continue;

      const food = await Food.findById(item.foodId);
      if (!food || !food.available) continue;

      const qty = parseInt(item.quantity);
      const itemTotal = food.price * qty;
      totalPrice += itemTotal;

      orderItems.push({
        food: food._id,
        name: food.name,
        price: food.price,
        quantity: qty,
      });
    }

    if (orderItems.length === 0) {
      req.flash('error', 'No valid items in cart.');
      return res.redirect('/orders/cart');
    }

    await Order.create({
      customer: req.session.userId,
      items: orderItems,
      totalPrice,
    });

    req.flash('success', '🎉 Order placed successfully! We are preparing your food.');
    res.redirect('/orders');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to place order. Please try again.');
    res.redirect('/orders/cart');
  }
};

// GET /orders/:id - View single order detail
exports.getOrderDetail = async (req, res) => {
  try {
    let order;
    if (req.session.userRole === 'admin') {
      order = await Order.findById(req.params.id).populate('customer', 'name email').lean();
    } else {
      order = await Order.findOne({ _id: req.params.id, customer: req.session.userId }).lean();
    }

    if (!order) {
      req.flash('error', 'Order not found.');
      return res.redirect('/orders');
    }

    res.render('orders/detail', { title: 'Order Detail', order });
  } catch (err) {
    req.flash('error', 'Order not found.');
    res.redirect('/orders');
  }
};

// PUT /orders/:id/status - Admin: update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Preparing', 'Completed', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      req.flash('error', 'Invalid status.');
      return res.redirect('/orders');
    }

    await Order.findByIdAndUpdate(req.params.id, { status });
    req.flash('success', `Order status updated to ${status}.`);
    res.redirect('/orders');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update order status.');
    res.redirect('/orders');
  }
};

// DELETE /orders/:id - Admin: delete order
exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    req.flash('success', 'Order deleted successfully.');
    res.redirect('/orders');
  } catch (err) {
    req.flash('error', 'Failed to delete order.');
    res.redirect('/orders');
  }
};
