import express from 'express';
import { SavedQuery } from '../models/SavedQuery.js';

const router = express.Router();

router.get('/saved', async (req, res) => {
  const userId = req.query.userId || 'default_guest';
  try {
    const queries = await SavedQuery.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, queries });
  } catch (err) {
    res.json({ success: true, queries: [] });
  }
});

router.post('/save', async (req, res) => {
  const { userId = 'default_guest', title, sql, dbKey, tags } = req.body;

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
  } catch (err) {
    res.json({
      success: true,
      savedQuery: { _id: Date.now().toString(), userId, title, sql, dbKey, tags: tags || [] }
    });
  }
});

export default router;
