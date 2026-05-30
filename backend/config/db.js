const mongoose = require('mongoose');

const connectDB = async () => {
  if (process.env.DB_MODE === 'json') {
    console.log('⚠️ Forced Mode: Using Local JSON File Database Storage');
    return;
  }

  try {
    // Attempt Mongoose connection with a 2.5 second timeout
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shopease', {
      serverSelectionTimeoutMS: 2500,
    });
    process.env.DB_MODE = 'mongodb';
    console.log(`🔌 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    process.env.DB_MODE = 'json';
    console.log('⚠️ MongoDB Connection Failed. Switching to Local JSON File Database Storage...');
    console.log('📌 Server will run out-of-the-box using backend/data/*.json files.');
  }
};

module.exports = connectDB;
