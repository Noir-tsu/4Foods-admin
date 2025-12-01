const User = require('../models/User');
const Order = require('../models/Order');
const { Parser } = require('json2csv');

exports.exportUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    const fields = [
      { label: 'Id', value: '_id' },
      { label: 'Name', value: 'name' },
      { label: 'Email', value: 'email' },
      { label: 'Role', value: 'role' },
      { label: 'Phone', value: 'phone' },
      { label: 'RegisteredAt', value: 'createdAt' },
      { label: 'IsActive', value: 'isActive' }
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(users);
    res.header('Content-Type', 'text/csv');
    res.attachment('users.csv');
    return res.send(csv);
  } catch (err) {
    console.error('Export users error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.exportOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('customerId', 'name email').populate('shopId', 'name').lean();
    const fields = [
      { label: 'Id', value: '_id' },
      { label: 'OrderId', value: 'orderId' },
      { label: 'CustomerName', value: row => row.customerId?.name || '' },
      { label: 'CustomerEmail', value: row => row.customerId?.email || '' },
      { label: 'ShopName', value: row => row.shopId?.name || '' },
      { label: 'Amount', value: 'amount' },
      { label: 'Status', value: 'status' },
      { label: 'CreatedAt', value: 'createdAt' }
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(orders);
    res.header('Content-Type', 'text/csv');
    res.attachment('orders.csv');
    return res.send(csv);
  } catch (err) {
    console.error('Export orders error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
