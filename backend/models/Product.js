const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: String,
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  status: { type: String, enum: ['draft','published','archived'], default: 'published' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  images: [String]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
