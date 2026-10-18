import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, default: 'default_guest' },
  solvedQuestions: [{ type: String }],
  mcqScores: [{
    questionId: String,
    category: String,
    isCorrect: Boolean,
    timestamp: { type: Date, default: Date.now }
  }],
  interviewCompleted: [{ type: String }],
  unlockedProgress: {
    employee_db: {
      Beginner: { type: Number, default: 0 },
      Intermediate: { type: Number, default: 0 },
      Pro: { type: Number, default: 0 }
    },
    hospital_db: {
      Beginner: { type: Number, default: 0 },
      Intermediate: { type: Number, default: 0 },
      Pro: { type: Number, default: 0 }
    }
  },
  updatedAt: { type: Date, default: Date.now }
});

export const UserProgress = mongoose.models.UserProgress || mongoose.model('UserProgress', userProgressSchema);
