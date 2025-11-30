const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(100);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const n = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!n) return res.status(404).json({ message: 'Notification not found' });
    res.json(n);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.clearNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.json({ message: 'Notifications cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
