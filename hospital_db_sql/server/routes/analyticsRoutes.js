import express from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Analytics from '../models/Analytics.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// In-memory fallback store when MongoDB is unavailable (e.g., offline dev or test runs)
const inMemoryEvents = [];
const MAX_IN_MEMORY_EVENTS = 5000;
const TARGET_ALLOW_PATTERN = /^[a-zA-Z0-9_.:/-]{1,120}$/;

function isMongoConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

// Middleware to verify only the admin can access analytics stats
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

// PUBLIC: Log a visit or button click
router.post('/track', async (req, res) => {
  try {
    const { eventType, target } = req.body || {};

    if (!['visit', 'click'].includes(eventType)) {
      return res.status(400).json({ error: 'Invalid eventType. Must be "visit" or "click".' });
    }

    if (typeof target !== 'string' || !TARGET_ALLOW_PATTERN.test(target.trim())) {
      return res.status(400).json({ error: 'Invalid target. Must be 1-120 safe identifier characters.' });
    }

    const sanitizedTarget = target.trim();

    if (isMongoConnected()) {
      await Analytics.create({ eventType, target: sanitizedTarget });
    } else {
      inMemoryEvents.unshift({
        _id: `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        eventType,
        target: sanitizedTarget,
        timestamp: new Date()
      });
      if (inMemoryEvents.length > MAX_IN_MEMORY_EVENTS) {
        inMemoryEvents.length = MAX_IN_MEMORY_EVENTS;
      }
    }

    res.status(201).json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to log event' });
  }
});

// ADMIN ONLY: Fetch aggregated visits and clicks
router.get('/stats', verifyAdmin, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  try {
    if (isMongoConnected()) {
      const [totalVisits, totalClicks, clicksByTarget, recentActivity] = await Promise.all([
        Analytics.countDocuments({ eventType: 'visit' }),
        Analytics.countDocuments({ eventType: 'click' }),
        Analytics.aggregate([
          { $match: { eventType: 'click' } },
          { $group: { _id: '$target', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        Analytics.find()
          .sort({ timestamp: -1 })
          .limit(10)
          .lean()
      ]);

      return res.json({
        totalVisits,
        totalClicks,
        clicksByTarget,
        recentActivity
      });
    }

    // In-memory aggregation fallback
    let totalVisits = 0;
    let totalClicks = 0;
    const clickCounts = new Map();

    for (const evt of inMemoryEvents) {
      if (evt.eventType === 'visit') {
        totalVisits += 1;
      } else if (evt.eventType === 'click') {
        totalClicks += 1;
        clickCounts.set(evt.target, (clickCounts.get(evt.target) || 0) + 1);
      }
    }

    const clicksByTarget = Array.from(clickCounts.entries())
      .map(([_id, count]) => ({ _id, count }))
      .sort((a, b) => b.count - a.count);

    const recentActivity = inMemoryEvents.slice(0, 10);

    res.json({
      totalVisits,
      totalClicks,
      clicksByTarget,
      recentActivity
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
