const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');

const seedData = require('../data/seedData.json');

const importData = async () => {
  try {
    // 1. Initialize DB Connection
    await connectDB();

    console.log('🧹 Clearing old database records...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Order.deleteMany({});

    // 2. Hash Seed User Passwords
    console.log('🔐 Hashing default user passwords...');
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);

    // 3. Create Seed Users
    const seededUsers = [
      {
        name: 'Demo Admin',
        email: 'admin@shopease.com',
        password: adminPassword,
        role: 'admin',
        wishlist: []
      }
    ];

    // Create user profiles in database
    const createdUsers = [];
    for (const u of seededUsers) {
      const created = await User.create(u);
      createdUsers.push(created);
    }
    console.log(`👤 Created ${createdUsers.length} seed users.`);

    // 4. Create Categories
    const createdCategories = [];
    for (const c of seedData.categories) {
      const created = await Category.create(c);
      createdCategories.push(created);
    }
    console.log(`📂 Created ${createdCategories.length} categories.`);

    // 5. Create Products (and link reviews to seeded users if needed)
    let productCount = 0;
    for (const p of seedData.products) {
      // Map user fields in review back to real customer user
      const mappedReviews = p.reviews.map((r, index) => ({
        ...r,
        user: createdUsers[0]._id.toString() // assign all to customer
      }));

      await Product.create({
        ...p,
        reviews: mappedReviews
      });
      productCount++;
    }
    console.log(`📦 Created ${productCount} products.`);

    console.log('🎉 Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`❌ Data seeding failed: ${error.message}`);
    process.exit(1);
  }
};

importData();
