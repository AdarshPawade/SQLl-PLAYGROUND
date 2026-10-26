import mongoose from 'mongoose';

export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sql_playground';
  
  // Return cached active connection in Serverless environments (Vercel / Lambda)
  if (mongoose.connection && mongoose.connection.readyState >= 1) {
    return { isConnected: true, uri: mongoUri };
  }

  // Connection Pool & Timeout configuration for 1,000+ users
  const options = {
    maxPoolSize: 100, // Handle high concurrent load
    minPoolSize: 5,   // Maintain warm socket connections
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    autoIndex: process.env.NODE_ENV !== 'production'
  };

  try {
    await mongoose.connect(mongoUri, options);
    console.log(`[MongoDB] Connected successfully to ${mongoUri} (Pool: max 100, min 10)`);

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB Notice] Connection lost. Auto-reconnecting...');
    });

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB Error]', err.message);
    });

    return { isConnected: true, uri: mongoUri };
  } catch (err) {
    console.warn(`[MongoDB Notice] MongoDB not available at ${mongoUri}. Operating with in-memory fallback.`);
    return { isConnected: false, error: err.message };
  }
}

