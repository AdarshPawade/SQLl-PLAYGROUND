import express from 'express';
import { SavedQuery } from '../models/SavedQuery.js';
import { extractUserSession } from '../utils/auth.js';

const router = express.Router();

router.use(extractUserSession);

function resolveUserId(req, fallback = null) {
  if (!req.user.isGuest && req.user.id) {
    return String(req.user.id);
  }
  const raw = fallback || req.headers['x-guest-id'] || 'default_guest';
  return String(raw).trim().replace(/[^a-zA-Z0-9_.-]/g, '').substring(0, 64) || 'default_guest';
}

router.get('/saved', async (req, res) => {
  const userId = resolveUserId(req, req.query.userId);
  try {
    const queries = await SavedQuery.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, queries });
  } catch {
    res.json({ success: true, queries: [] });
  }
});

router.post('/save', async (req, res) => {
  const userId = resolveUserId(req, req.body.userId);
  const { title, sql, dbKey, tags } = req.body;

  if (!title || !sql || !dbKey) {
    return res.status(400).json({ success: false, error: 'Missing required title, sql, or dbKey.' });
  }

  try {
    const newQuery = await SavedQuery.create({
      userId,
      title,
      sql,
      dbKey,
      tags: tags || ['custom']
    });

    res.json({ success: true, savedQuery: newQuery });
  } catch {
    res.json({
      success: true,
      savedQuery: { _id: Date.now().toString(), userId, title, sql, dbKey, tags: tags || [] }
    });
  }
});

export default router;
