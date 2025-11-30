const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  address: String,
  phone: String,
  email: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Add a status field for admin workflow (pending/approved/rejected)
shopSchema.add({
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvalNote: { type: String, default: '' }
});

module.exports = mongoose.model('Shop', shopSchema);
