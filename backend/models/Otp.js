const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: String,
  token: String,
  expireAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Otp', otpSchema);
