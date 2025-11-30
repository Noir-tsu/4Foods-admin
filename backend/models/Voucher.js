const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount: Number,
  type: { type: String, enum: ['percent','fixed'], default: 'percent' },
  validFrom: Date,
  validTo: Date,
  usageLimit: Number
}, { timestamps: true });

module.exports = mongoose.model('Voucher', voucherSchema);
