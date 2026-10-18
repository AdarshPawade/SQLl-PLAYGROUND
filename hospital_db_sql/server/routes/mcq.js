import express from 'express';
import { MCQ_QUESTIONS } from '../../src/data/mcqData.js';

const router = express.Router();

router.get('/', (req, res) => {
  // Strip correctAnswer from questions list if client requests question paper without reveals
  const sanitizedQuestions = MCQ_QUESTIONS.map(q => ({
    id: q.id,
    category: q.category,
    question: q.question,
    options: q.options
  }));

  res.json({
    success: true,
    total: MCQ_QUESTIONS.length,
    questions: sanitizedQuestions,
    fullData: MCQ_QUESTIONS // Included for instant frontend evaluation mode
  });
});

router.post('/evaluate', (req, res) => {
  const { questionId, answerIndex } = req.body;
  const target = MCQ_QUESTIONS.find(q => q.id === questionId);

  if (!target) {
    return res.status(404).json({ success: false, error: 'Question not found' });
  }

  const isCorrect = target.correctAnswer === parseInt(answerIndex, 10);

  res.json({
    success: true,
    questionId,
    isCorrect,
    correctAnswer: target.correctAnswer,
    explanation: target.explanation
  });
});

export default router;
