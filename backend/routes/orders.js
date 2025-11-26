const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Order management routes
router.get('/', ordersController.getAllOrders);
router.get('/pending', ordersController.getPendingOrders);
router.get('/:id', ordersController.getOrderById);
router.put('/:id/status', ordersController.updateOrderStatus);
router.put('/:id/approve', ordersController.approveOrder);
router.put('/:id/reject', ordersController.rejectOrder);
router.delete('/:id', ordersController.deleteOrder);

module.exports = router;