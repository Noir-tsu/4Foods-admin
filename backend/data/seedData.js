const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Shop = require('../models/Shop');
const Order = require('../models/Order');

async function connect() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/4foods', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}

async function seed() {
  await connect();
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Category.deleteMany({}),
    Shop.deleteMany({}),
    Order.deleteMany({})
  ]);

  const admin = await User.create({ name: 'Admin', email: 'admin@example.com', password: 'admin123', role: 'admin' });
  const user = await User.create({ name: 'John Doe', email: 'john@example.com', password: 'john123', role: 'user' });
  const shop = await Shop.create({ name: 'Demo Shop', ownerId: admin._id, email: 'shop@example.com', phone: '0123456789', address: '1 Admin St' });
  const cat = await Category.create({ type: 'product', name: 'Electronics' });
  const prod = await Product.create({ name: 'iPhone 14', sku: 'IP14', price: 999.99, stock: 10, category: cat._id, shopId: shop._id });
  const order = await Order.create({ customerId: user._id, shopId: shop._id, items: [{ productId: prod._id, quantity: 1, price: prod.price }], amount: prod.price, status: 'pending', shippingAddress: { address: '123 Main St', city: 'Hanoi', country: 'VN', zipCode: '10000' }, paymentMethod: 'cash_on_delivery' });

  console.log('Seed finished');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
