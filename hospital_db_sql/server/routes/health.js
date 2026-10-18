import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const states = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' };

  res.json({
    status: 'HEALTHY',
    service: 'SQL Practice Playground MERN Backend',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    security: {
      headers: 'Fortified (Helmet Enabled)',
      rateLimiting: 'Active',
      sandbox: 'Isolated WASM SQL Engine'
    },
    database: {
      status: states[mongoState] || 'Unknown',
      connected: mongoState === 1
    }
  });
});

export default router;
