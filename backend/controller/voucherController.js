const Voucher = require('../models/Voucher');

exports.getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    res.json(vouchers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createVoucher = async (req, res) => {
  try {
    const v = await Voucher.create(req.body);
    res.status(201).json(v);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateVoucher = async (req, res) => {
  try {
    const v = await Voucher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!v) return res.status(404).json({ message: 'Voucher not found' });
    res.json(v);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteVoucher = async (req, res) => {
  try {
    await Voucher.findByIdAndDelete(req.params.id);
    res.json({ message: 'Voucher deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
