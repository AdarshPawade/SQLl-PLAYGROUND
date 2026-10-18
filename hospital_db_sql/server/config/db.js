import mongoose from 'mongoose';

export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sql_playground';
  
  try {
    // Attempt connecting with a short timeout to handle environments without MongoDB
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected successfully to ${mongoUri}`);
    return { isConnected: true, uri: mongoUri };
  } catch (err) {
    console.warn(`[MongoDB Warning] Could not connect to MongoDB at ${mongoUri}. Operating with graceful in-memory session fallback.`);
    return { isConnected: false, error: err.message };
  }
}
