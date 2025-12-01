const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/4foods', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/shops', require('./routes/shops'));
app.use('/api/carts', require('./routes/carts'));
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/otps', require('./routes/otps'));
app.use('/api/loyalty', require('./routes/loyalties'));
app.use('/api/vouchers', require('./routes/vouchers'));
app.use('/api/admin', require('./routes/admin'));
// Serve Admin frontend static files (built admin SPA) from dist-modern
const adminStaticPath = path.join(__dirname, 'dist-modern');
app.use('/admin', express.static(adminStaticPath));
// For SPA client-side routing – serve index.html
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(adminStaticPath, 'index.html'));
});

// Admin exports and settings
app.use('/api/export', require('./routes/export'));
app.use('/api/settings', require('./routes/settings'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});