import express from 'express';
import { UserProgress } from '../models/UserProgress.js';
import { extractUserSession } from '../utils/auth.js';

const router = express.Router();

// Robust in-memory store for environments running without live MongoDB
const inMemoryProgress = new Map();

// Extract authentication if present, otherwise set guest context
router.use(extractUserSession);

function resolveUserId(req, fallback = null) {
  // If user is authenticated via token/cookie, always use their authenticated ID (prevents IDOR)
  if (!req.user.isGuest && req.user.id) {
    return String(req.user.id);
  }
  // Otherwise use provided guest identity or fallback
  const raw = fallback || req.headers['x-guest-id'] || 'default_guest';
  const clean = String(raw).trim().replace(/[^a-zA-Z0-9_.-]/g, '').substring(0, 64);
  return clean || 'default_guest';
}

function getInitialProgress(userId) {
  return {
    userId,
    solvedQuestions: [],
    mcqScores: [],
    interviewCompleted: [],
    unlockedProgress: {
      employee_db: { Beginner: 0, Intermediate: 0, Pro: 0 },
      hospital_db: { Beginner: 0, Intermediate: 0, Pro: 0 }
    },
    updatedAt: new Date()
  };
}

router.get('/', async (req, res) => {
  const userId = resolveUserId(req, req.query.userId);
  try {
    let progress = await UserProgress.findOne({ userId });
    if (!progress) {
      progress = inMemoryProgress.get(userId) || getInitialProgress(userId);
    }
    res.json({ success: true, progress });
  } catch {
    const progress = inMemoryProgress.get(userId) || getInitialProgress(userId);
    res.json({ success: true, progress });
  }
});

router.post('/', async (req, res) => {
  const userId = resolveUserId(req, req.body.userId);
  const { solvedQuestionId, unlockedProgress, mcqScore, interviewId } = req.body;

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
  } catch {
    // In-memory fallback
    let progress = inMemoryProgress.get(userId) || getInitialProgress(userId);

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
    inMemoryProgress.set(userId, progress);

    res.json({ success: true, progress, message: 'Saved in memory session' });
  }
});

/**
 * Onboarding Bridge: Sync Guest Progress into Authenticated User Account
 */
router.post('/sync', async (req, res) => {
  const userId = resolveUserId(req);
  const { completedChallenges = [], unlockedProgress = {}, mcqScores = [] } = req.body;

  try {
    let progress = await UserProgress.findOne({ userId });
    if (!progress) {
      progress = new UserProgress({ userId, solvedQuestions: [] });
    }

    // Merge solved questions (deduplicated)
    const combinedSolved = new Set([...(progress.solvedQuestions || []), ...completedChallenges]);
    progress.solvedQuestions = Array.from(combinedSolved);

    // Merge unlocked levels (take highest reached)
    if (unlockedProgress && typeof unlockedProgress === 'object') {
      const current = progress.unlockedProgress || {};
      progress.unlockedProgress = {
        employee_db: {
          Beginner: Math.max(current.employee_db?.Beginner || 0, unlockedProgress.employee_db?.Beginner || 0),
          Intermediate: Math.max(current.employee_db?.Intermediate || 0, unlockedProgress.employee_db?.Intermediate || 0),
          Pro: Math.max(current.employee_db?.Pro || 0, unlockedProgress.employee_db?.Pro || 0)
        },
        hospital_db: {
          Beginner: Math.max(current.hospital_db?.Beginner || 0, unlockedProgress.hospital_db?.Beginner || 0),
          Intermediate: Math.max(current.hospital_db?.Intermediate || 0, unlockedProgress.hospital_db?.Intermediate || 0),
          Pro: Math.max(current.hospital_db?.Pro || 0, unlockedProgress.hospital_db?.Pro || 0)
        }
      };
    }

    if (Array.isArray(mcqScores) && mcqScores.length > 0) {
      progress.mcqScores.push(...mcqScores);
    }

    progress.updatedAt = new Date();
    await progress.save();

    res.json({
      success: true,
      message: 'Onboarding progress successfully synchronized with cloud account.',
      progress
    });
  } catch {
    // In-memory fallback
    let progress = inMemoryProgress.get(userId) || getInitialProgress(userId);

    const combinedSolved = new Set([...(progress.solvedQuestions || []), ...completedChallenges]);
    progress.solvedQuestions = Array.from(combinedSolved);

    if (unlockedProgress && typeof unlockedProgress === 'object') {
      const current = progress.unlockedProgress || {};
      progress.unlockedProgress = {
        employee_db: {
          Beginner: Math.max(current.employee_db?.Beginner || 0, unlockedProgress.employee_db?.Beginner || 0),
          Intermediate: Math.max(current.employee_db?.Intermediate || 0, unlockedProgress.employee_db?.Intermediate || 0),
          Pro: Math.max(current.employee_db?.Pro || 0, unlockedProgress.employee_db?.Pro || 0)
        },
        hospital_db: {
          Beginner: Math.max(current.hospital_db?.Beginner || 0, unlockedProgress.hospital_db?.Beginner || 0),
          Intermediate: Math.max(current.hospital_db?.Intermediate || 0, unlockedProgress.hospital_db?.Intermediate || 0),
          Pro: Math.max(current.hospital_db?.Pro || 0, unlockedProgress.hospital_db?.Pro || 0)
        }
      };
    }

    if (Array.isArray(mcqScores) && mcqScores.length > 0) {
      progress.mcqScores.push(...mcqScores);
    }

    progress.updatedAt = new Date();
    inMemoryProgress.set(userId, progress);

    res.json({
      success: true,
      message: 'Synchronized in session fallback.',
      progress
    });
  }
});

export default router;
