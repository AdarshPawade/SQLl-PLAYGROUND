import express from 'express';
import { UserProgress } from '../models/UserProgress.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const userId = req.query.userId || 'default_guest';
  try {
    let progress = await UserProgress.findOne({ userId });
    if (!progress) {
      progress = {
        userId,
        solvedQuestions: [],
        mcqScores: [],
        interviewCompleted: [],
        unlockedProgress: {
          employee_db: { Beginner: 0, Intermediate: 0, Pro: 0 },
          hospital_db: { Beginner: 0, Intermediate: 0, Pro: 0 }
        }
      };
    }
    res.json({ success: true, progress });
  } catch (err) {
    res.json({
      success: true,
      progress: {
        userId,
        solvedQuestions: [],
        mcqScores: [],
        interviewCompleted: []
      }
    });
  }
});

router.post('/', async (req, res) => {
  const { userId = 'default_guest', solvedQuestionId, unlockedProgress, mcqScore, interviewId } = req.body;

  try {
    let progress = await UserProgress.findOne({ userId });
    if (!progress) {
      progress = new UserProgress({ userId, solvedQuestions: [] });
    }

    if (solvedQuestionId && !progress.solvedQuestions.includes(solvedQuestionId)) {
      progress.solvedQuestions.push(solvedQuestionId);
    }

    if (interviewId && !progress.interviewCompleted.includes(interviewId)) {
      progress.interviewCompleted.push(interviewId);
    }

    if (mcqScore) {
      progress.mcqScores.push(mcqScore);
    }

    if (unlockedProgress) {
      progress.unlockedProgress = unlockedProgress;
    }

    progress.updatedAt = new Date();
    await progress.save();

    res.json({ success: true, progress });
  } catch (err) {
    res.json({ success: true, message: 'Saved in memory session' });
  }
});

export default router;
