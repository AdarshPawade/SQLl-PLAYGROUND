import express from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Analytics from '../models/Analytics.js';
import { User } from '../models/User.js';
import { UserProgress } from '../models/UserProgress.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// In-memory fallback store when MongoDB is unavailable (e.g., offline dev or test runs)
const inMemoryEvents = [];
const MAX_IN_MEMORY_EVENTS = 5000;
const ALLOWED_EVENT_TYPES = new Set(['visit', 'click', 'auth', 'solve']);
const TARGET_ALLOW_PATTERN = /^[a-zA-Z0-9_.:/-]{1,120}$/;
const ACTOR_ALLOW_PATTERN = /^[a-zA-Z0-9_.-]{1,64}$/;

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

// PUBLIC: Log a visit, click, auth, or challenge solve event
router.post('/track', async (req, res) => {
  try {
    const { eventType, target, actor } = req.body || {};

    if (!ALLOWED_EVENT_TYPES.has(eventType)) {
      return res.status(400).json({ error: 'Invalid eventType. Must be "visit", "click", "auth", or "solve".' });
    }

    if (typeof target !== 'string' || !TARGET_ALLOW_PATTERN.test(target.trim())) {
      return res.status(400).json({ error: 'Invalid target. Must be 1-120 safe identifier characters.' });
    }

    const sanitizedTarget = target.trim();
    const sanitizedActor =
      typeof actor === 'string' && ACTOR_ALLOW_PATTERN.test(actor.trim())
        ? actor.trim()
        : 'guest';

    if (isMongoConnected()) {
      await Analytics.create({ eventType, target: sanitizedTarget, actor: sanitizedActor });
    } else {
      inMemoryEvents.unshift({
        _id: `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        eventType,
        target: sanitizedTarget,
        actor: sanitizedActor,
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

// ADMIN ONLY: Fetch aggregated visits, clicks, user summary, and recent activity
router.get('/stats', verifyAdmin, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  try {
    if (isMongoConnected()) {
      const [
        totalVisits,
        totalClicks,
        totalSolves,
        totalAuthEvents,
        totalUsers,
        clicksByTarget,
        recentActivity,
        recentUsersRaw
      ] = await Promise.all([
        Analytics.countDocuments({ eventType: 'visit' }),
        Analytics.countDocuments({ eventType: 'click' }),
        Analytics.countDocuments({ eventType: 'solve' }),
        Analytics.countDocuments({ eventType: 'auth' }),
        User.countDocuments(),
        Analytics.aggregate([
          { $match: { eventType: { $in: ['click', 'auth', 'solve'] } } },
          { $group: { _id: '$target', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 25 }
        ]),
        Analytics.find()
          .sort({ timestamp: -1 })
          .limit(25)
          .lean(),
        User.find()
          .select('username email role profile.fullName createdAt lastLogin')
          .sort({ lastLogin: -1, createdAt: -1 })
          .limit(20)
          .lean()
      ]);

      const userIds = recentUsersRaw.map(u => String(u._id));
      const progressDocs = userIds.length > 0
        ? await UserProgress.find()
            .where('userId')
            .in(userIds)
            .select('userId solvedQuestions updatedAt')
            .lean()
        : [];
      const solvedByUserId = new Map(
        progressDocs.map(p => [String(p.userId), Array.isArray(p.solvedQuestions) ? p.solvedQuestions.length : 0])
      );

      const recentUsers = recentUsersRaw.map(u => ({
        id: String(u._id),
        username: u.username,
        email: u.email,
        role: u.role,
        fullName: u.profile?.fullName || u.username,
        solvedCount: solvedByUserId.get(String(u._id)) || 0,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin
      }));

      return res.json({
        storageMode: 'mongodb',
        totalVisits,
        totalClicks,
        totalSolves,
        totalAuthEvents,
        totalUsers,
        clicksByTarget,
        recentActivity,
        recentUsers
      });
    }

    // In-memory aggregation fallback
    let totalVisits = 0;
    let totalClicks = 0;
    let totalSolves = 0;
    let totalAuthEvents = 0;
    const clickCounts = new Map();

    for (const evt of inMemoryEvents) {
      if (evt.eventType === 'visit') {
        totalVisits += 1;
      } else if (evt.eventType === 'click') {
        totalClicks += 1;
        clickCounts.set(evt.target, (clickCounts.get(evt.target) || 0) + 1);
      } else if (evt.eventType === 'solve') {
        totalSolves += 1;
        clickCounts.set(evt.target, (clickCounts.get(evt.target) || 0) + 1);
      } else if (evt.eventType === 'auth') {
        totalAuthEvents += 1;
        clickCounts.set(evt.target, (clickCounts.get(evt.target) || 0) + 1);
      }
    }

    const clicksByTarget = Array.from(clickCounts.entries())
      .map(([_id, count]) => ({ _id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 25);

    const recentActivity = inMemoryEvents.slice(0, 25);

    res.json({
      storageMode: 'memory',
      totalVisits,
      totalClicks,
      totalSolves,
      totalAuthEvents,
      totalUsers: 0,
      clicksByTarget,
      recentActivity,
      recentUsers: []
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
