const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Admin index endpoints - use existing controllers and routers
const dashboardController = require('../controller/dashboardController');
// Attach admin-only middleware
router.use(auth());

router.get('/overview', dashboardController.getOverview);
router.get('/recent-activity', dashboardController.getRecentActivity);
router.get('/recent-orders', dashboardController.getRecentOrders);
router.get('/charts/revenue', dashboardController.getRevenueChartData);
router.get('/charts/order-status', dashboardController.getOrderStatusDistribution);
router.get('/charts/account-growth', dashboardController.getAccountGrowthData);

module.exports = router;
