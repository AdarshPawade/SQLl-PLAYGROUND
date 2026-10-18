import express from 'express';
import { ALL_CHALLENGES } from '../../src/data/challenges.js';

const router = express.Router();

router.get('/', (req, res) => {
  const dbKey = req.query.dbKey || 'employee_db';
  const challenges = ALL_CHALLENGES[dbKey] || ALL_CHALLENGES.employee_db;
  
  res.json({
    success: true,
    dbKey,
    counts: {
      Beginner: challenges.Beginner ? challenges.Beginner.length : 0,
      Intermediate: challenges.Intermediate ? challenges.Intermediate.length : 0,
      Pro: challenges.Pro ? challenges.Pro.length : 0,
      total: (challenges.Beginner?.length || 0) + (challenges.Intermediate?.length || 0) + (challenges.Pro?.length || 0)
    },
    challenges
  });
});

export default router;
