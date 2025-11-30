// controllers/dashboardController.js
const Order = require('../models/Order');
const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const { formatDate, getDateRanges } = require('../utils/dateUtils');

// @desc    Get dashboard overview statistics
// @route   GET /api/dashboard/overview
// @access  Private/Admin
exports.getOverview = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const previousMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const previousMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    // Tổng doanh thu tháng này
    const currentMonthRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: currentMonthStart },
          status: { $in: ['completed', 'shipped'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Tổng doanh thu tháng trước
    const previousMonthRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
          status: { $in: ['completed', 'shipped'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Đếm đơn hàng tháng này
    const currentMonthOrders = await Order.countDocuments({
      createdAt: { $gte: currentMonthStart }
    });

    // Đếm đơn hàng tháng trước
    const previousMonthOrders = await Order.countDocuments({
      createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd }
    });

    // Người dùng mới tháng này
    const newUsers = await User.countDocuments({
      createdAt: { $gte: currentMonthStart }
    });

    // Người dùng mới tháng trước
    const previousMonthUsers = await User.countDocuments({
      createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd }
    });

    // Cửa hàng active
    const activeShops = await Shop.countDocuments({ isActive: true });

    // Shipper active (giả sử shipper là role trong User)
    const activeShippers = await User.countDocuments({ role: 'shipper', isActive: true });

    // Tính phần trăm thay đổi
    const calculatePercentage = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous * 100).toFixed(1);
    };

    const revenueCurrent = currentMonthRevenue[0]?.total || 0;
    const revenuePrevious = previousMonthRevenue[0]?.total || 0;
    const revenuePercentage = calculatePercentage(revenueCurrent, revenuePrevious);

    const ordersPercentage = calculatePercentage(currentMonthOrders, previousMonthOrders);
    const usersPercentage = calculatePercentage(newUsers, previousMonthUsers);

    res.json({
      revenue: {
        current: revenueCurrent,
        percentage: parseFloat(revenuePercentage)
      },
      orders: {
        current: currentMonthOrders,
        percentage: parseFloat(ordersPercentage)
      },
      users: {
        current: newUsers,
        percentage: parseFloat(usersPercentage)
      },
      shops: {
        current: activeShops,
        percentage: 5.4 // Có thể tính tương tự nếu có dữ liệu lịch sử
      },
      shippers: {
        current: activeShippers,
        percentage: 3.7 // Có thể tính tương tự nếu có dữ liệu lịch sử
      }
    });

  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get recent activities
// @route   GET /api/dashboard/recent-activity
// @access  Private/Admin
exports.getRecentActivity = async (req, res) => {
  try {
    // Lấy từ notifications hoặc kết hợp từ nhiều collections
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customerId', 'name');

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name createdAt');

    // Kết hợp các hoạt động
    const activities = [
      ...recentOrders.map(order => ({
        type: 'order',
        description: `New order #${order.orderId} from ${order.customerId?.name || 'Customer'}`,
        createdAt: order.createdAt
      })),
      ...recentUsers.map(user => ({
        type: 'user',
        description: `New user registered: ${user.name}`,
        createdAt: user.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
     .slice(0, 10);

    res.json(activities);
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get recent orders
// @route   GET /api/dashboard/recent-orders
// @access  Private/Admin
exports.getRecentOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('customerId', 'name email')
      .select('orderId amount status createdAt');

    const formattedOrders = orders.map(order => ({
      orderId: order.orderId,
      customerId: {
        name: order.customerId?.name || 'Unknown Customer',
        email: order.customerId?.email || ''
      },
      amount: order.amount,
      status: order.status,
      createdAt: order.createdAt
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Recent orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get revenue chart data
// @route   GET /api/dashboard/charts/revenue
// @access  Private/Admin
exports.getRevenueChartData = async (req, res) => {
  try {
    const { period = '1m' } = req.query;
    const { startDate, endDate, groupFormat } = getDateRanges(period);

    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['completed', 'shipped'] }
        }
      },
      {
        $group: {
          _id: groupFormat,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const labels = revenueData.map(item => item._id);
    const values = revenueData.map(item => item.total);

    res.json({ labels, values });
  } catch (error) {
    console.error('Revenue chart error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get order status distribution
// @route   GET /api/dashboard/charts/order-status
// @access  Private/Admin
exports.getOrderStatusDistribution = async (req, res) => {
  try {
    const statusDistribution = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Map status để phù hợp với frontend
    const statusMap = {
      'pending': 'Pending',
      'confirmed': 'Processing', 
      'processing': 'Processing',
      'shipped': 'Processing',
      'delivered': 'Completed',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };

    const formattedData = statusDistribution.reduce((acc, item) => {
      const status = statusMap[item._id] || item._id;
      if (acc[status]) {
        acc[status] += item.count;
      } else {
        acc[status] = item.count;
      }
      return acc;
    }, {});

    const labels = Object.keys(formattedData);
    const values = Object.values(formattedData);

    res.json({ labels, values });
  } catch (error) {
    console.error('Order status chart error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get account growth data
// @route   GET /api/dashboard/charts/account-growth
// @access  Private/Admin
exports.getAccountGrowthData = async (req, res) => {
  try {
    const { period = '1m' } = req.query;
    const { startDate, endDate, groupFormat } = getDateRanges(period);

    // Người dùng mới
    const newUsersData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: groupFormat,
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Người dùng active (giả sử active là đã đăng nhập trong 30 ngày)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsersData = await User.aggregate([
      {
        $match: {
          lastLogin: { $gte: thirtyDaysAgo },
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: groupFormat,
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const labels = newUsersData.map(item => item._id);
    const newUsers = newUsersData.map(item => item.count);
    
    // Map active users theo cùng labels
    const activeUsers = labels.map(label => {
      const found = activeUsersData.find(item => item._id === label);
      return found ? found.count : 0;
    });

    res.json({ labels, newUsers, activeUsers });
  } catch (error) {
    console.error('Account growth chart error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};