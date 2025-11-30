const mongoose = require('mongoose');

const loyaltySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  points: { type: Number, default: 0 },
  tier: { type: String, enum: ['bronze','silver','gold','platinum'], default: 'bronze' }
}, { timestamps: true });

module.exports = mongoose.model('Loyalty', loyaltySchema);
