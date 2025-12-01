const express = require('express');
const router = express.Router();
const exportController = require('../controller/exportController');
const auth = require('../middleware/auth');

// Admin-only
router.use(auth());

router.get('/users', exportController.exportUsers);
router.get('/orders', exportController.exportOrders);

module.exports = router;
