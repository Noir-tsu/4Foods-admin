const Otp = require('../models/Otp');

exports.createOtp = async (req, res) => {
  try {
    const { phone, token, expireAt } = req.body;
    const otp = await Otp.create({ phone, token, expireAt });
    res.status(201).json(otp);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phone, token } = req.body;
    const otp = await Otp.findOne({ phone, token });
    if (!otp) return res.status(404).json({ message: 'Invalid or expired OTP' });
    res.json({ message: 'OTP valid' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
