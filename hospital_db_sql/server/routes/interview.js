import express from 'express';
import { INTERVIEW_CHALLENGES } from '../../src/data/interviewPrep.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    total: INTERVIEW_CHALLENGES.length,
    challenges: INTERVIEW_CHALLENGES
  });
});

export default router;
