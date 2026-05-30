const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize express application
const app = express();

// Set Up Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to Database (MongoDB or JSON fallback)
connectDB().then(() => {
  // Seed default festivals
  const seedFestivals = require('./utils/festivalSeeder');
  seedFestivals();
});

// API Route Mounts
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const festivalRoutes = require('./routes/festivalRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/festivals', festivalRoutes);

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    mode: process.env.DB_MODE,
    timestamp: new Date().toISOString()
  });
});

// Custom 404 handler for missing endpoints
app.use((req, res, next) => {
  res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error('Express App Error:', err.message);
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 ShopEase server running in ${process.env.DB_MODE} mode on port ${PORT}`);
});
