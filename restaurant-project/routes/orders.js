const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { ensureAuth, ensureAdmin, ensureCustomer } = require('../middleware/auth');

router.get('/', ensureAuth, orderController.getOrders);
router.get('/cart', ensureCustomer, orderController.getCart);
router.post('/', ensureCustomer, orderController.placeOrder);
router.get('/:id', ensureAuth, orderController.getOrderDetail);
router.put('/:id/status', ensureAdmin, orderController.updateOrderStatus);
router.delete('/:id', ensureAdmin, orderController.deleteOrder);

module.exports = router;
