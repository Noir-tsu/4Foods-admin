const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  body: String,
  isRead: { type: Boolean, default: false },
  meta: Object
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
