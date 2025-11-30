const express = require('express');
const router = express.Router();
const dash = require('../controller/dashboardController');
const auth = require('../middleware/auth');

router.use(auth());

router.get('/overview', dash.getOverview);
router.get('/recent-activity', dash.getRecentActivity);
router.get('/recent-orders', dash.getRecentOrders);
router.get('/charts/revenue', dash.getRevenueChartData);
router.get('/charts/order-status', dash.getOrderStatusDistribution);
router.get('/charts/account-growth', dash.getAccountGrowthData);

module.exports = router;
