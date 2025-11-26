const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Activity = require('../models/Activity');

// Get dashboard overview data
exports.getDashboardOverview = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfLastMonth = new Date(currentYear, currentMonth, 0);
    
    // Current month data
    const [
      currentMonthRevenue,
      currentMonthOrders,
      currentMonthUsers,
      currentMonthShops,
      currentMonthShippers,
      lastMonthRevenue,
      lastMonthOrders,
      lastMonthUsers,
      lastMonthShops,
      lastMonthShippers
    ] = await Promise.all([
      // Current month
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ createdAt: { $gte: startOfMonth }, role: 'customer' }),
      User.countDocuments({ createdAt: { $gte: startOfMonth }, role: 'shop' }),
      User.countDocuments({ createdAt: { $gte: startOfMonth }, role: 'shipper' }),
      
      // Last month
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, role: 'customer' }),
      User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, role: 'shop' }),
      User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, role: 'shipper' })
    ]);
    
    const calculatePercentage = (current, previous) => {
      if (!previous || previous === 0) return 0;
      return ((current - previous) / previous * 100).toFixed(1);
    };
    
    const overview = {
      revenue: {
        current: currentMonthRevenue[0]?.total || 0,
        previous: lastMonthRevenue[0]?.total || 0,
        percentage: calculatePercentage(currentMonthRevenue[0]?.total || 0, lastMonthRevenue[0]?.total || 0)
      },
      orders: {
        current: currentMonthOrders,
        previous: lastMonthOrders,
        percentage: calculatePercentage(currentMonthOrders, lastMonthOrders)
      },
      users: {
        current: currentMonthUsers,
        previous: lastMonthUsers,
        percentage: calculatePercentage(currentMonthUsers, lastMonthUsers)
      },
      shops: {
        current: currentMonthShops,
        previous: lastMonthShops,
        percentage: calculatePercentage(currentMonthShops, lastMonthShops)
      },
      shippers: {
        current: currentMonthShippers,
        previous: lastMonthShippers,
        percentage: calculatePercentage(currentMonthShippers, lastMonthShippers)
      }
    };
    
    res.json(overview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get recent activity
exports.getRecentActivity = async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name');
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get recent orders
exports.getRecentOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(7)
      .populate('customerId', 'name')
      .populate('shopId', 'name');
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Refresh dashboard data
exports.refreshDashboardData = async (req, res) => {
  try {
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Log the refresh activity
    const activity = new Activity({
      type: 'system',
      action: 'dashboard_refresh',
      description: 'Dashboard data refreshed manually',
      userId: req.user.id
    });
    await activity.save();
    
    res.json({ message: 'Dashboard data refreshed successfully', timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};