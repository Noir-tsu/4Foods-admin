const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Basic stats for the admin; we reuse dashboard controller or provide simple counts
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

router.use(auth());

router.get('/counts', async (req, res) => {
  try {
    const users = await User.countDocuments();
    const products = await Product.countDocuments();
    const orders = await Order.countDocuments();
    res.json({ users, products, orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
