const Loyalty = require('../models/Loyalty');

exports.getAllLoyalties = async (req, res) => {
  try {
    const loyalties = await Loyalty.find().populate('userId', 'name email');
    res.json(loyalties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateLoyalty = async (req, res) => {
  try {
    const { points, tier } = req.body;
    const loyalty = await Loyalty.findByIdAndUpdate(req.params.id, { points, tier }, { new: true });
    if (!loyalty) return res.status(404).json({ message: 'Loyalty entry not found' });
    res.json(loyalty);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
