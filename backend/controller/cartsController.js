const Cart = require('../models/Cart');

exports.getCarts = async (req, res) => {
  try {
    const carts = await Cart.find().populate('userId items.productId');
    res.json(carts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCartByUser = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate('items.productId');
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const cart = await Cart.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCart = async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cart deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
