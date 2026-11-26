import express from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Analytics from '../models/Analytics.js';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// In-memory fallback store when MongoDB is offline (e.g., local dev without DB or unit tests)
const inMemoryVisits = [];
const MAX_IN_MEMORY_VISITS = 5000;

function isMongoConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

function getLastNDaysKeys(days = 7) {
  const keys = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}

// Middleware to verify admin secret key
const verifyAdmin = (req, res, next) => {
  const expectedSecret = process.env.ADMIN_SECRET;
  const adminKey = req.headers['x-admin-key'];

  if (!expectedSecret || typeof adminKey !== 'string' || !adminKey) {
    logger.securityAlert('Unauthorized admin analytics access attempt (missing/unconfigured key)', { ip: req.ip });
    return res.status(403).json({ message: 'Unauthorized: Admin only' });
  }

  const expectedBuf = Buffer.from(expectedSecret, 'utf8');
  const providedBuf = Buffer.from(adminKey, 'utf8');

  if (
    expectedBuf.length !== providedBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, providedBuf)
  ) {
    logger.securityAlert('Unauthorized admin analytics access attempt (invalid key)', { ip: req.ip });
    return res.status(403).json({ message: 'Unauthorized: Admin only' });
  }

  next();
};

// PUBLIC: Increment site visit counter (no user actions or PII logged)
router.post('/track', async (req, res) => {
  try {
    const { eventType = 'visit' } = req.body || {};
    if (eventType !== 'visit') {
      return res.status(400).json({ error: 'Only "visit" counting is enabled.' });
    }

    if (isMongoConnected()) {
      await Analytics.create({ eventType: 'visit' });
    } else {
      inMemoryVisits.push({ timestamp: new Date() });
      if (inMemoryVisits.length > MAX_IN_MEMORY_VISITS) {
        inMemoryVisits.shift();
      }
    }

    res.status(201).json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to count visit' });
  }
});

// ADMIN ONLY: Return aggregate visitor & registered user counts (no activity logs)
router.get('/stats', verifyAdmin, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  try {
    const dayKeys = getLastNDaysKeys(7);
    const todayKey = dayKeys[dayKeys.length - 1];
    const startOfToday = new Date(`${todayKey}T00:00:00.000Z`);
    const startOf7Days = new Date(`${dayKeys[0]}T00:00:00.000Z`);

    if (isMongoConnected()) {
      const [
        totalVisits,
        visitsToday,
        totalUsers,
        usersToday,
        dailyVisitsAgg,
        dailyUsersAgg
      ] = await Promise.all([
        Analytics.countDocuments({ eventType: 'visit' }),
        Analytics.countDocuments({ eventType: 'visit', timestamp: { $gte: startOfToday } }),
        User.countDocuments(),
        User.countDocuments({ createdAt: { $gte: startOfToday } }),
        Analytics.aggregate([
          { $match: { eventType: 'visit', timestamp: { $gte: startOf7Days } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              count: { $sum: 1 }
            }
          }
        ]),
        User.aggregate([
          { $match: { createdAt: { $gte: startOf7Days } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 }
            }
          }
        ])
      ]);

      const visitByDay = new Map(dailyVisitsAgg.map(d => [d._id, d.count]));
      const usersByDay = new Map(dailyUsersAgg.map(d => [d._id, d.count]));

      const dailyStats = dayKeys.map(date => ({
        date,
        visits: visitByDay.get(date) || 0,
        newUsers: usersByDay.get(date) || 0
      }));

      const visitsLast7Days = dailyStats.reduce((sum, d) => sum + d.visits, 0);
      const usersLast7Days = dailyStats.reduce((sum, d) => sum + d.newUsers, 0);
      const conversionRate = totalVisits > 0
        ? Number(((totalUsers / totalVisits) * 100).toFixed(1))
        : 0;

      return res.json({
        storageMode: 'mongodb',
        totalVisits,
        visitsToday,
        visitsLast7Days,
        totalUsers,
        usersToday,
        usersLast7Days,
        conversionRate,
        dailyStats
      });
    }

    // In-memory fallback
    const visitByDay = new Map();
    let visitsToday = 0;
    for (const v of inMemoryVisits) {
      const key = new Date(v.timestamp).toISOString().slice(0, 10);
      visitByDay.set(key, (visitByDay.get(key) || 0) + 1);
      if (key === todayKey) visitsToday += 1;
    }

    const dailyStats = dayKeys.map(date => ({
      date,
      visits: visitByDay.get(date) || 0,
      newUsers: 0
    }));

    const totalVisits = inMemoryVisits.length;
    const visitsLast7Days = dailyStats.reduce((sum, d) => sum + d.visits, 0);

    res.json({
      storageMode: 'memory',
      totalVisits,
      visitsToday,
      visitsLast7Days,
      totalUsers: 0,
      usersToday: 0,
      usersLast7Days: 0,
      conversionRate: 0,
      dailyStats
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
