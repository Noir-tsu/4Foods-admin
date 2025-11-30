const Shop = require('../models/Shop');

exports.getAllShops = async (req, res) => {
  try {
    const { page = 1, limit = 50, q = '', status } = req.query;
    const filter = {};
    if (q) filter.name = { $regex: q, $options: 'i' };
    if (status) filter.status = status;
    const shops = await Shop.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .populate('ownerId', 'name email');
    res.json(shops);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createShop = async (req, res) => {
  try {
    const shop = await Shop.create(req.body);
    res.status(201).json(shop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateShop = async (req, res) => {
  try {
    const shop = await Shop.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json(shop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findByIdAndDelete(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json({ message: 'Shop deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('ownerId', 'name email');
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json(shop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin approves or rejects shop
exports.changeShopStatus = async (req, res) => {
  try {
    const { status, approvalNote } = req.body; // status: 'approved' or 'rejected'
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const update = { status };
    if (approvalNote) update.approvalNote = approvalNote;
    // Toggle isActive automatically when approved
    if (status === 'approved') update.isActive = true;
    if (status === 'rejected') update.isActive = false;
    const shop = await Shop.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json(shop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
